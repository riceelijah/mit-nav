import { createApp, ref, computed, watch, onMounted, nextTick } from "vue/dist/vue.esm-bundler.js";
import { createHttpClient } from "@mit-sdg/sync-engine-http/client";
import type { CampusWireHttp } from "../generated/wire.ts";
import outlineData from "./outlines.json" with { type: "json" };
// Building outlines (lat, long rings) written by the campus converter.
const outlines = outlineData as unknown as Record<string, [number, number][][]>;

const client: any = createHttpClient<CampusWireHttp>({ baseUrl: "/api" });

type Place = { place: string; name: string; kind: string; floor: number };
const floorLabel = (floor: number) => (floor === 0 ? "Basement" : `Floor ${floor}`);
// Within this many metres of a building's centre counts as reaching it; further than OFF_COURSE from the route, twice in a row, reroutes.
const REACHED = 40;
const OFF_COURSE = 75;
const MIT: [number, number] = [42.3601, -71.0942];
declare const L: any; // Leaflet, loaded from unpkg in index.html

type Point = [number, number];
const known = (p: { latitude?: number; longitude?: number } | null | undefined) => !!p && !!(p.latitude || p.longitude);
/** Distance along the ground in metres; flat-earth is exact enough across a campus. */
function groundMeters([lat1, lon1]: Point, [lat2, lon2]: Point) {
  const x = (lon2 - lon1) * 111_320 * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  return Math.hypot(x, (lat2 - lat1) * 111_320);
}
/** Distance in metres from a point to the line through `line`, measured in a local flat frame around the point. */
function metersFromLine(p: Point, line: Point[]) {
  if (line.length === 1) return groundMeters(p, line[0]);
  const k = Math.cos((p[0] * Math.PI) / 180);
  const flat = ([lat, lon]: Point) => [(lon - p[1]) * 111_320 * k, (lat - p[0]) * 111_320];
  let best = Infinity;
  for (let i = 0; i + 1 < line.length; i++) {
    const [ax, ay] = flat(line[i]), [bx, by] = flat(line[i + 1]);
    const dx = bx - ax, dy = by - ay;
    const t = dx || dy ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy))) : 0;
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return best;
}

const CORRIDOR = /^Walk about (\d+) m along the corridors?\.$/;
const OUTSIDE = /^Walk about (\d+) m outside(?: along (.+))?\.$/;
const joinNames = (names: string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);

/**
 * Shows several corridor walks, or several outdoor path segments, in a row as one step, adding up the
 * metres written in them; an outdoor step names the streets it follows.
 */
export function mergeSteps(steps: any[]) {
  const shown: any[] = [];
  // `upto` is the index of the last raw step a shown step covers, so the map can split the line at it.
  steps.forEach((s, upto) => {
    const prev = shown[shown.length - 1];
    const corridor = CORRIDOR.exec(s.instruction), outside = OUTSIDE.exec(s.instruction);
    const kind = corridor ? "corridor" : outside ? "outside" : "";
    if (kind && prev?.merge === kind) {
      // Keep the first connection (that is the one flagged) and arrive where the last one does.
      const meters = prev.meters + Number((corridor ?? outside)![1]);
      const streets = outside?.[2] && !prev.streets.includes(outside[2]) ? [...prev.streets, outside[2]] : prev.streets;
      const along = streets.filter((n: string) => n !== "a crosswalk");
      const instruction = kind === "corridor"
        ? `Walk about ${meters} m along the corridors.`
        : `Walk about ${meters} m outside${along.length ? `, along ${joinNames(along)}` : ""}${streets.includes("a crosswalk") ? ", crossing at the crosswalk" : ""}.`;
      Object.assign(prev, { ...s, link: prev.link, distance: prev.distance + s.distance, meters, streets, instruction, merge: kind, upto });
    } else {
      shown.push({ ...s, merge: kind, meters: Number((corridor ?? outside)?.[1] ?? 0), streets: outside?.[2] ? [outside[2]] : [], upto });
    }
  });
  return shown.map((s, i) => ({ ...s, step: i + 1 }));
}
// ---- Floor plans, redrawn from room positions (not MIT's drawings). ----
type Flat = [number, number];
/** Cuts a polygon to the side of the line through `a` perpendicular to a→b that is nearer `a` (one Voronoi half-plane). */
function nearerTo(poly: Flat[], a: Flat, b: Flat): Flat[] {
  const mid: Flat = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const n: Flat = [b[0] - a[0], b[1] - a[1]];
  const side = (p: Flat) => (p[0] - mid[0]) * n[0] + (p[1] - mid[1]) * n[1]; // < 0 on a's side
  const out: Flat[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const sp = side(p), sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) {
      const t = sp / (sp - sq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return out;
}
/**
 * One cell per position inside the building outline: the part of the outline nearer that position than any
 * other. A position several places share was borrowed (from a corridor or the building), so it is drawn only
 * as the corridor among them, if there is one.
 */
export function floorCells(places: { name: string; kind: string; latitude: number; longitude: number }[], outline: [number, number][][]) {
  const groups = new Map<string, typeof places>();
  for (const p of places) {
    const key = `${p.latitude},${p.longitude}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(p);
  }
  const sites = [...groups.values()]
    .map((g) => (g.length === 1 ? g[0] : g.find((p) => p.kind === "TRANSIT")))
    .filter((p): p is (typeof places)[number] => !!p);
  const lat0 = sites[0]?.latitude ?? 0;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const flat = (lat: number, lon: number): Flat => [lon * 111_320 * k, lat * 111_320];
  const back = ([x, y]: Flat): [number, number] => [y / 111_320, x / (111_320 * k)];
  const points = sites.map((p) => flat(p.latitude, p.longitude));
  // ponytail: n² half-plane cuts per floor; fine for a few hundred rooms.
  return sites.map((site, i) => ({
    ...site,
    rings: outline
      .map((ring) => {
        let poly = ring.map(([lat, lon]) => flat(lat, lon));
        for (let j = 0; j < points.length && poly.length; j++) if (j !== i) poly = nearerTo(poly, points[i], points[j]);
        return poly.map(back);
      })
      .filter((r) => r.length >= 3),
  }));
}
const BUILDING_PREFIX = /^([A-Z]*\d+[A-Z]*)-/;

// Outdoor path points have generated names that mean nothing to a person.
const arrivalLabel = (s: any) => (/^Path \d+$/.test(s.placeName) ? "" : `${s.placeName}, floor ${s.floor}`);

type Units = "METERS" | "FEET" | "MINUTES";
const units = ref<Units>("METERS");
/** A distance in the person's units: metres (km from 1000 m), feet (miles from 1000 ft), or walking minutes at 80 m a minute. */
function distanceLabel(m: number) {
  if (units.value === "FEET") {
    const feet = m / 0.3048;
    return feet >= 1000 ? `${(feet / 5280).toFixed(1)} mi` : `${Math.round(feet / 10) * 10 || Math.round(feet)} ft`;
  }
  if (units.value === "MINUTES") {
    const minutes = m / 80;
    return minutes < 1 ? "under a minute" : `${Math.round(minutes)} min`;
  }
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
/** Directions carry "about N m"; show them in the person's units. */
const inUnits = (text: string) => text.replace(/about (\d+) m\b/g, (_, m) => `about ${distanceLabel(Number(m))}`);
function remembered(key: string) {
  try { return localStorage.getItem(key) ?? ""; } catch { return ""; }
}
function remember(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage is optional */ }
}
units.value = (["METERS", "FEET", "MINUTES"].includes(remembered("units")) ? remembered("units") : "METERS") as Units;

/** The place with exactly this name, found through search (the browser never holds the whole map). */
async function placeNamed(name: string): Promise<Place | null> {
  const result = await client.map.search({ text: name });
  return "error" in result ? null : (result.places.places.find((p: Place) => p.name === name) ?? null);
}

const app = createApp({
  template: `
  <div class="app" :class="{ open: sheetOpen }">
    <aside class="panel" aria-label="Directions">
      <button class="handle" @click="sheetOpen = !sheetOpen" :aria-expanded="sheetOpen" aria-label="Show or hide directions"><span></span></button>
      <button v-if="to" class="peek" @click="sheetOpen = true" aria-label="Show directions">
        <span class="number">{{ plaque.number }}</span>
        <span class="next">{{ steps[doneCount] ? inUnits(steps[doneCount].instruction) : 'Tap for directions' }}</span>
      </button>

      <header class="brand">
        <span class="mark" aria-hidden="true">MIT</span>
        <span class="title">Navigator</span>
        <button v-if="me" class="quiet" @click="signOut" :title="'Signed in as ' + me">{{ me }} <span class="dim">Sign out</span></button>
        <button v-else class="quiet" @click="showSignIn = true">Sign in</button>
      </header>

      <section class="planner">
        <place-picker label="From" v-model="from" />
        <button class="swap" @click="swap" aria-label="Swap start and destination" title="Swap">⇅</button>
        <place-picker label="To" v-model="to" />
        <div class="nearby" role="group" aria-label="Find the nearest">
          <span>Nearest</span>
          <button v-for="k in kinds" :key="k.label" :aria-pressed="nearestKind === k.label" @click="findNearest(k)">{{ k.label }}</button>
        </div>
        <div class="options">
          <label class="toggle" :class="{ on: accessibleOnly }"><input type="checkbox" v-model="accessibleOnly" /> Step-free</label>
          <label class="time">Leaving at <input type="time" v-model="time" /></label>
        </div>
      </section>

      <nav class="tabs" role="tablist">
        <button role="tab" :aria-selected="tab === 'route'" @click="tab = 'route'">Route</button>
        <button role="tab" :aria-selected="tab === 'saved'" @click="tab = 'saved'">Saved</button>
        <button role="tab" :aria-selected="tab === 'problems'" @click="tab = 'problems'">Problems<span v-if="reports.length + unreported.length" class="count">{{ reports.length + unreported.length }}</span></button>
      </nav>

      <div class="body">
        <p v-if="message" :class="['note', messageKind]" role="status">{{ message }}</p>

        <section v-show="tab === 'route'" class="route">
          <div v-if="nearestKind" class="closest">
            <h2>Nearest {{ nearestKind.toLowerCase() }} from {{ from ? from.name : 'your start' }}</h2>
            <p v-if="!closest.length" class="empty">{{ from ? 'Nothing of that kind is reachable from here' + (accessibleOnly ? ' without stairs' : '') + '.' : 'Choose where you are first.' }}</p>
            <ul class="list">
              <li v-for="c in closest" :key="c.place">
                <button class="go" @click="chooseClosest(c)">{{ c.name }}<span class="at">Floor {{ c.floor }}<template v-if="c.meters !== undefined">, about {{ distanceLabel(c.meters) }} away</template></span></button>
              </li>
            </ul>
            <button class="quiet" @click="nearestKind = ''">Close</button>
          </div>
          <div v-if="to" class="plaque">
            <span class="number">{{ plaque.number }}</span>
            <span class="what">{{ plaque.what }}</span>
          </div>
          <p v-if="from && to && from.place === to.place" class="empty">You're already there.</p>
          <p v-else-if="searched && steps.length === 0" class="empty">
            No route{{ accessibleOnly ? ' without stairs' : '' }} avoids the blocked or closed passages right now.
            <template v-if="accessibleOnly">Turn off step-free to allow stairs.</template>
          </p>
          <template v-if="steps.length">
            <div class="summary">
              <span><strong>{{ distanceLabel(routeMeters) }}</strong> estimated walk</span>
              <span>{{ steps.length }} steps</span>
              <label class="toggle small" :class="{ on: tracking }"><input type="checkbox" v-model="tracking" /> Follow me</label>
            </div>
            <div v-if="me && to" class="keep">
              <button class="quiet" @click="toggleFavorite(to)" :aria-pressed="isFavorite(to)">{{ isFavorite(to) ? '★ Favorite' : '☆ Favorite' }}</button>
              <form v-if="from" @submit.prevent="saveTrip"><input type="text" v-model="tripName" placeholder="Name this trip" aria-label="Trip name" /><button class="quiet" type="submit">Save trip</button></form>
            </div>
            <ol class="steps">
              <li v-for="(s, i) in steps" :key="s.step" :class="{ done: i < doneCount, current: i === doneCount }">
                <span class="n">{{ s.step }}</span>
                <div class="text">
                  <p>{{ inUnits(s.instruction) }}</p>
                  <p v-if="arrivalLabel(s)" class="at">{{ arrivalLabel(s) }}</p>
                  <div class="acts">
                    <button v-if="i === doneCount" class="quiet" @click="doneCount++">Done</button>
                    <button class="quiet warn" @click="startFlag(s.link)">Report a problem</button>
                  </div>
                  <form v-if="flagging === s.link" class="flag" @submit.prevent="block(s.link)">
                    <input type="text" v-model="reason" placeholder="What's wrong? e.g. elevator out of service" aria-label="What's wrong" />
                    <button class="primary" type="submit">Report</button>
                  </form>
                </div>
              </li>
            </ol>
            <button v-if="me" class="primary wide" @click="finishTrip" :disabled="finished">{{ finished ? 'Trip recorded' : "I've arrived" }}</button>
            <div v-if="routeFloors.length" class="floors">
              <p>Floor plans on this route</p>
              <div class="chips">
                <button v-for="f in routeFloors" :key="f.building + '/' + f.floor" :aria-pressed="!!activeFloor && activeFloor.building === f.building && activeFloor.floor === f.floor" @click="showFloor(f)">{{ f.building }}, floor {{ f.floor }}</button>
                <button v-if="activeFloor" class="quiet" @click="hideFloor">Hide plan</button>
              </div>
              <p v-if="activeFloor" class="fine">Redrawn from room positions on MIT's plans, so walls are approximate. Zoom in to read room numbers.</p>
            </div>
          </template>
        </section>

        <section v-show="tab === 'saved'" class="saved">
          <template v-if="me && mine">
            <h2>Favorites</h2>
            <p v-if="!mine.favorites.length" class="empty">Star a destination to keep it here.</p>
            <ul class="list">
              <li v-for="f in mine.favorites" :key="f.place">
                <button class="go" @click="to = f; tab = 'route'">{{ f.name }}</button>
                <button class="quiet" @click="toggleFavorite(f)" aria-label="Remove from favorites">★</button>
              </li>
            </ul>
            <h2>Trips</h2>
            <p v-if="!mine.trips.length" class="empty">Plan a route, then save it with a name.</p>
            <ul class="list">
              <li v-for="t in mine.trips" :key="t.trip">
                <button class="go" @click="useTrip(t); tab = 'route'">{{ t.name }}<span class="at">{{ t.sourceName }} to {{ t.destinationName }}{{ t.accessibleOnly ? ', step-free' : '' }}</span></button>
                <button class="quiet" @click="removeTrip(t.trip)" aria-label="Delete trip">Delete</button>
              </li>
            </ul>
            <h2>Travels</h2>
            <p class="tally"><strong>{{ mine.totals.trips }}</strong> {{ mine.totals.trips === 1 ? 'trip' : 'trips' }}, about <strong>{{ distanceLabel(mine.totals.meters) }}</strong> walked</p>
            <ul class="list">
              <li v-for="h in mine.history" :key="h.entry"><span>{{ h.sourceName }} to {{ h.destinationName }}</span><span class="at">{{ distanceLabel(h.meters) }}</span></li>
            </ul>
            <h2>Preferences</h2>
            <label class="toggle" :class="{ on: prefStepFree }"><input type="checkbox" v-model="prefStepFree" @change="savePreferences" /> Step-free routes by default</label>
            <label class="toggle" :class="{ on: prefLocation }"><input type="checkbox" v-model="prefLocation" @change="savePreferences" /> Follow my location when I open the app</label>
          </template>
          <h2>Distances</h2>
          <div class="segmented" role="radiogroup" aria-label="Show distances in">
            <label v-for="u in unitChoices" :key="u.value" :class="{ on: units === u.value }"><input type="radio" name="units" :value="u.value" v-model="units" @change="chooseUnits" /> {{ u.label }}</label>
          </div>
          <div v-else class="empty">
            <p>Sign in to keep favorite places, saved trips and how far you've walked.</p>
            <button class="primary" @click="showSignIn = true">Sign in</button>
          </div>
        </section>

        <section v-show="tab === 'problems'" class="problems">
          <p v-if="!reports.length && !unreported.length" class="empty">Nothing is blocked right now. If a door, elevator or path is out of service, report it from a step of your route.</p>
          <ul class="list">
            <li v-for="r in reports" :key="r.report">
              <span><strong>{{ r.forward }}</strong><span class="at">{{ r.sourceName }} to {{ r.destinationName }}</span><span class="at">{{ r.reporter ?? 'Someone' }}: {{ r.reason }}</span></span>
              <button class="quiet" @click="unblock(r.link)">Mark clear</button>
            </li>
            <li v-for="l in unreported" :key="l.link">
              <span><strong>{{ l.forward }}</strong><span class="at">{{ l.sourceName }} to {{ l.destinationName }}{{ l.service ? ', ' + l.service : '' }}</span></span>
              <button class="quiet" @click="unblock(l.link)">Mark clear</button>
            </li>
          </ul>
        </section>
      </div>
    </aside>

    <div id="map" aria-label="Map"></div>

    <div v-if="(showSignIn && !me) || choosing" class="modal" role="dialog" aria-modal="true" aria-labelledby="signin-title" @click.self="showSignIn = false">
      <section class="sheet-card">
        <template v-if="choosing">
          <h2 id="signin-title">Choose a username</h2>
          <p>Your Commons username is taken here or can't be used. Pick another.</p>
          <form @submit.prevent="chooseUsername">
            <label>Username <input type="text" v-model="username" autocomplete="username" required /></label>
            <button class="primary wide" type="submit">Continue</button>
          </form>
        </template>
        <template v-else>
          <h2 id="signin-title">{{ creating ? 'Create an account' : 'Sign in' }}</h2>
          <button class="commons wide" @click="startCommons">Continue with your MIT class account</button>
          <p class="or">or use a username and password</p>
          <form @submit.prevent="submitPassword">
            <label>Username
              <input type="text" v-model="username" autocomplete="username" autocapitalize="off" spellcheck="false" required />
              <span v-if="creating" class="hint">3 to 32 letters, digits, _ or -</span>
            </label>
            <label>Password
              <input type="password" v-model="password" :autocomplete="creating ? 'new-password' : 'current-password'" required />
              <span v-if="creating" class="hint">8 to 128 characters</span>
            </label>
            <button class="primary wide" type="submit">{{ creating ? 'Create account' : 'Sign in' }}</button>
          </form>
          <p class="switch">{{ creating ? 'Have an account?' : 'New here?' }}
            <button class="link" @click="creating = !creating; authError = ''">{{ creating ? 'Sign in' : 'Create an account' }}</button></p>
        </template>
        <p v-if="authError" class="note bad" role="alert">{{ authError }}</p>
        <button class="close quiet" @click="showSignIn = false" aria-label="Close">Close</button>
      </section>
    </div>
  </div>
`,
  setup() {
    const me = ref<string | null>(null);
    const mine = ref<any>(null);
    const showSignIn = ref(false);
    const creating = ref(false);
    const choosing = ref(false);
    const username = ref("");
    const password = ref("");
    const authError = ref("");
    const reports = ref<any[]>([]);
    const blocked = ref<any[]>([]);
    const steps = ref<any[]>([]);
    const from = ref<Place | null>(null);
    const to = ref<Place | null>(null);
    const accessibleOnly = ref(false);
    const prefStepFree = ref(false);
    const prefLocation = ref(false);
    const tripName = ref("");
    const finished = ref(false);
    const tracking = ref(false);
    const tab = ref<"route" | "saved" | "problems">("route");
    const sheetOpen = ref(true);
    /** The destination as a door plaque: its number large, what it is beneath. */
    const plaque = computed(() => {
      const name = to.value?.name ?? "";
      const room = /^([A-Z]*\d+[A-Z]*-\S+)\s+(.*)$/.exec(name);
      if (room) return { number: room[1], what: room[2] };
      const building = /^(.*) \(Building ([^)]+)\)$/.exec(name) ?? /^Building ([^,]+)$/.exec(name);
      if (building) return building.length === 3 ? { number: building[2], what: building[1] } : { number: building[1], what: "Building" };
      return { number: name, what: "" };
    });
    function swap() { [from.value, to.value] = [to.value, from.value]; }
    const doneCount = ref(0);
    const now = new Date();
    const time = ref(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    const hour = computed(() => {
      const [h, m] = time.value.split(":").map(Number);
      return (h || 0) + (m || 0) / 60;
    });
    const searched = ref(false);
    const flagging = ref("");
    const reason = ref("");
    const message = ref("");
    const messageKind = ref("ok");
    const say = (text: string, kind = "ok") => { message.value = text; messageKind.value = kind; };
    // The walking the directions describe: the "about N m" written in each step (rides add none).
    const routeMeters = computed(() => steps.value.reduce((sum, s) => sum + Number(/about (\d+) m/.exec(s.instruction)?.[1] ?? 0), 0));
    // Blocked passages that have no open report still need a way to be cleared.
    const unreported = computed(() => blocked.value.filter((l) => !reports.value.some((r) => r.link === l.link)));

    async function loadMe() {
      const result = await client.auth.me({});
      me.value = "error" in result ? null : result.username;
      if (me.value) await loadMine();
      else mine.value = null;
    }
    async function loadMine() {
      const result = await client.me({});
      if ("error" in result) return;
      mine.value = {
        favorites: result.favorites.favorites,
        trips: result.trips.trips,
        history: result.history.history,
        totals: result.totals.totals[0] ?? { trips: 0, meters: 0 },
      };
      const p = result.preferences.preferences[0];
      prefStepFree.value = p?.stepFree ?? false;
      prefLocation.value = p?.useLocation ?? false;
      if (p?.units) { units.value = p.units; remember("units", p.units); }
    }
    /** Sends a sign-in request; on success loads the person, on refusal shows the sentence for its category. */
    async function enter(answer: Promise<any>, messages: Record<string, string>) {
      const result = await answer;
      if ("error" in result) {
        authError.value = messages[result.error] ?? "Something went wrong. Try again.";
        return result.error as string;
      }
      authError.value = ""; showSignIn.value = false; choosing.value = false; password.value = "";
      await loadMe();
      accessibleOnly.value = prefStepFree.value;
      return null;
    }
    const submitPassword = () =>
      creating.value
        ? enter(client.auth.register({ username: username.value.trim(), password: password.value }), {
            CONFLICT: "That username is taken.",
            INVALID_REQUEST: "That username or password doesn't follow the rules under each box.",
          })
        : enter(client.auth.login({ username: username.value.trim(), password: password.value }), {
            UNAUTHORIZED: "The username or password is incorrect.",
          });
    async function startCommons() {
      const result = await client.auth.commons.start({});
      if ("error" in result) return (authError.value = "Commons sign-in isn't available right now. Try again.");
      window.location.assign(result.address);
    }
    async function finishCommons() {
      const query = new URLSearchParams(window.location.search);
      // Clear the code from the address before posting it, so reloading or going back doesn't post it again.
      window.history.replaceState(null, "", "/");
      if (query.get("error") === "access_denied") return (authError.value = "Sign-in cancelled.");
      const refused = await enter(client.auth.commons.finish({ state: query.get("state") ?? "", code: query.get("code") ?? "" }), {
        CONFLICT: "Your Commons username is taken here.",
        INVALID_REQUEST: "Your Commons username can't be used here.",
        FORBIDDEN: "Signing in with Commons didn't work. Start again.",
      });
      if (refused === "CONFLICT" || refused === "INVALID_REQUEST") choosing.value = true;
      else if (refused) showSignIn.value = true;
    }
    const chooseUsername = () =>
      enter(client.auth.commons.choose({ username: username.value.trim() }), {
        CONFLICT: "That username is taken.",
        INVALID_REQUEST: "That username doesn't follow the rule: 3 to 32 letters, digits, _ or -.",
        FORBIDDEN: "This sign-in has expired. Start again.",
      });
    async function signOut() {
      await client.auth.logout({});
      me.value = null; mine.value = null;
    }

    async function load() {
      const result = await client.map.overview({});
      if ("error" in result) return say(`Could not load the reports: ${result.error}`, "bad");
      reports.value = result.problems.reports;
      blocked.value = result.blocked.links;
    }

    let latestRoute = 0;
    let pathSteps: any[] = [];
    async function findRoute() {
      const asked = ++latestRoute;
      finished.value = false;
      if (!from.value || !to.value || from.value.place === to.value.place) { steps.value = []; searched.value = false; return; }
      const result = await client.route.find({ source: from.value.place, destination: to.value.place, accessibleOnly: accessibleOnly.value, hour: hour.value });
      if (asked !== latestRoute) return; // an answer to an older choice of places
      if ("error" in result) return say(`Could not find a route: ${result.error}`, "bad");
      pathSteps = result.route.steps; // every point, for drawing; the list shows merged steps
      steps.value = mergeSteps(result.route.steps);
      searched.value = true;
      doneCount.value = 0;
      draw();
    }

    // ---- The map: the route as a line through the places it reaches, and where the person is. ----
    let map: any, routeLayer: any, meMarker: any;
    /** The route as map points, and for each raw step the index of the last point it reaches. */
    const routeGeometry = () => {
      const points: Point[] = [];
      const reached: number[] = [];
      const add = (p: any) => {
        if (known(p)) {
          const pt: Point = [p.latitude, p.longitude];
          const last = points[points.length - 1];
          if (!last || last[0] !== pt[0] || last[1] !== pt[1]) points.push(pt);
        }
        return points.length - 1;
      };
      add(from.value);
      for (const s of pathSteps) reached.push(add(s));
      return { points, reached };
    };
    const routeLine = (): Point[] => routeGeometry().points;
    /**
     * The route line, split by progress: walked (grey), the step you're on (cardinal on signage yellow),
     * and still to come (cardinal). Without a location, a dot marks where the done steps end.
     */
    function drawProgress() {
      routeLayer.clearLayers();
      const { points, reached } = routeGeometry();
      if (!points.length) return points;
      const end = (stepIndex: number) => (stepIndex < 0 ? 0 : reached[steps.value[stepIndex]?.upto ?? pathSteps.length - 1] ?? points.length - 1);
      const doneTo = end(doneCount.value - 1);
      const currentTo = doneCount.value < steps.value.length ? end(doneCount.value) : doneTo;
      const part = (from: number, to: number) => points.slice(from, to + 1);
      if (doneTo > 0) L.polyline(part(0, doneTo), { color: "#7d8891", weight: 6, opacity: 0.85 }).addTo(routeLayer);
      if (currentTo > doneTo) {
        L.polyline(part(doneTo, currentTo), { color: "#f2cf5b", weight: 11, opacity: 0.95 }).addTo(routeLayer);
        L.polyline(part(doneTo, currentTo), { color: "#a31f34", weight: 5 }).addTo(routeLayer);
      }
      if (currentTo < points.length - 1) L.polyline(part(currentTo, points.length - 1), { color: "#a31f34", weight: 4, opacity: 0.75 }).addTo(routeLayer);
      L.circleMarker(points[0], { radius: 6, color: "#1c2b39", fillColor: "#ffffff", fillOpacity: 1, weight: 3 }).bindTooltip("Start").addTo(routeLayer);
      L.circleMarker(points[points.length - 1], { radius: 8, color: "#ffffff", fillColor: "#a31f34", fillOpacity: 1, weight: 3 }).bindTooltip("Destination").addTo(routeLayer);
      if (!tracking.value && doneTo > 0) L.circleMarker(points[doneTo], { radius: 6, color: "#ffffff", fillColor: "#1c2b39", fillOpacity: 1, weight: 2 }).bindTooltip("Where your done steps end").addTo(routeLayer);
      return points;
    }
    watch(doneCount, () => map && drawProgress());
    function draw() {
      if (!map) return;
      map.invalidateSize(); // the panel may have changed the map's size since it was laid out
      const line = drawProgress();
      if (!line.length) return;
      // On a phone the sheet covers the bottom of the map, so keep the route above it.
      const phone = window.matchMedia("(max-width: 760px)").matches;
      const covered = phone ? (sheetOpen.value ? window.innerHeight * 0.55 : 100) : 0;
      map.fitBounds(L.latLngBounds(line), { maxZoom: 18, paddingTopLeft: [30, 30], paddingBottomRight: [30, 30 + covered] });
    }

    // ---- Floor plans for the floors the route passes through. ----
    let floorLayer: any;
    const activeFloor = ref<{ building: string; floor: number } | null>(null);
    const routeFloors = computed(() => {
      const seen = new Map<string, { building: string; floor: number }>();
      for (const s of steps.value) {
        const building = BUILDING_PREFIX.exec(s.placeName)?.[1];
        if (building && building in outlines) seen.set(`${building}/${s.floor}`, { building, floor: s.floor });
      }
      return [...seen.values()];
    });
    async function showFloor(f: { building: string; floor: number }) {
      const result = await client.map.floor({ building: f.building, floor: f.floor });
      if ("error" in result) return say(`Could not load the floor plan: ${result.error}`, "bad");
      floorLayer.clearLayers();
      activeFloor.value = f;
      const outline = outlines[f.building];
      L.polygon(outline, { color: "#555", weight: 2, fillColor: "#fbfaf7", fillOpacity: 0.95 }).addTo(floorLayer);
      for (const cell of floorCells(result.plan.places, outline)) {
        const destination = to.value?.name === cell.name;
        const corridor = cell.kind === "TRANSIT";
        L.polygon(cell.rings, {
          color: "#8a8a8a", weight: 0.8,
          fillColor: destination ? "#f4b6be" : corridor ? "#f1e3bf" : "#ffffff", fillOpacity: 1,
        }).bindTooltip(cell.name).addTo(floorLayer);
        if (!corridor) {
          L.marker([cell.latitude, cell.longitude], { interactive: false, icon: L.divIcon({ className: "room-label", html: cell.name.split(" ")[0].replace(BUILDING_PREFIX, ""), iconSize: [60, 14] }) }).addTo(floorLayer);
        }
      }
      map.fitBounds(L.polygon(outline).getBounds().pad(0.05));
      if (window.matchMedia("(max-width: 760px)").matches) sheetOpen.value = false;
    }
    function hideFloor() { floorLayer.clearLayers(); activeFloor.value = null; draw(); }
    watch(steps, () => { if (activeFloor.value) hideFloor(); });
    watch(sheetOpen, () => setTimeout(() => (activeFloor.value ? undefined : draw()), 280)); // after the sheet slides

    // ---- Nearest restroom, food, study space or lounge, by route from the start. ----
    const kinds = [
      { label: "Restroom", text: "Lavatory" },
      { label: "Food", text: "Food Facility" },
      { label: "Study space", text: "Study" },
      { label: "Lounge", text: "Lounge" },
    ];
    const nearestKind = ref("");
    const closest = ref<any[]>([]);
    async function findNearest(kind: { label: string; text: string }) {
      nearestKind.value = kind.label;
      tab.value = "route";
      sheetOpen.value = true;
      closest.value = [];
      if (!from.value) return;
      const result = await client.route.closest({ source: from.value.place, text: kind.text, accessibleOnly: accessibleOnly.value, hour: hour.value });
      if ("error" in result) return;
      closest.value = result.closest.places;
      // How far each is: the metres written in its route, as for any route (the cost is not a length).
      const metres = await Promise.all(closest.value.map(async (c: any) => {
        const route = await client.route.find({ source: from.value!.place, destination: c.place, accessibleOnly: accessibleOnly.value, hour: hour.value });
        return "error" in route ? undefined : route.route.steps.reduce((sum: number, st: any) => sum + Number(/about (\d+) m/.exec(st.instruction)?.[1] ?? 0), 0);
      }));
      closest.value = closest.value.map((c: any, i: number) => ({ ...c, meters: metres[i] }));
    }
    function chooseClosest(c: any) {
      to.value = { place: c.place, name: c.name, kind: "ROOM", floor: c.floor };
      nearestKind.value = "";
    }

    // ---- Distance units: saved with the account when signed in, and on this device either way. ----
    const unitChoices = [
      { value: "METERS", label: "Metres" },
      { value: "FEET", label: "Feet" },
      { value: "MINUTES", label: "Minutes" },
    ];
    function chooseUnits() {
      remember("units", units.value);
      if (me.value) savePreferences();
    }

    // After "Done", bring the next step into view.
    watch(doneCount, async () => {
      await nextTick();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.querySelector(".steps li.current")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });

    // ---- Following the person's location (only while they have it turned on). ----
    let watchId: number | undefined;
    let offReadings = 0;
    let rerouting = false;
    watch(tracking, (on) => {
      if (on && !("geolocation" in navigator)) { tracking.value = false; return say("This browser can't share your location.", "bad"); }
      if (on) {
        offReadings = 0;
        watchId = navigator.geolocation.watchPosition(
          (p) => onReading([p.coords.latitude, p.coords.longitude]),
          () => { tracking.value = false; say("Couldn't get your location. Check that the browser may use it.", "bad"); },
          { enableHighAccuracy: true, maximumAge: 5000 },
        );
      } else {
        if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
        watchId = undefined;
        meMarker?.remove(); meMarker = undefined;
      }
    });
    async function onReading(here: Point) {
      if (map) {
        meMarker ??= L.circleMarker(here, { radius: 8, color: "#1a5fb4", fillColor: "#1a5fb4", fillOpacity: 0.9 }).bindTooltip("You").addTo(map);
        meMarker.setLatLng(here);
      }
      // Only a step that arrives at a building can be checked from outside; reaching it finishes every step before it.
      steps.value.forEach((s, i) => {
        if (i >= doneCount.value && s.kind === "ENTRANCE" && known(s) && groundMeters(here, [s.latitude, s.longitude]) <= REACHED) doneCount.value = i + 1;
      });
      const line = routeLine();
      if (!line.length || doneCount.value >= steps.value.length || rerouting) return;
      offReadings = metersFromLine(here, line) > OFF_COURSE ? offReadings + 1 : 0;
      if (offReadings >= 2) await reroute(here);
    }
    async function reroute(here: Point) {
      rerouting = true;
      offReadings = 0; // two fresh readings are needed before rerouting again
      try {
        const answer = await client.route.nearest({ latitude: here[0], longitude: here[1] });
        const nearest = "error" in answer ? undefined : answer.nearest.places[0];
        if (!nearest || !to.value) return say("You seem to be off the route, and no nearby building was found. Keep to the line on the map.", "bad");
        const result = await client.route.find({ source: nearest.place, destination: to.value.place, accessibleOnly: accessibleOnly.value, hour: nowHour() });
        if ("error" in result || !result.route.steps.length) return say(`You seem to be off the route, and there is no route from ${nearest.name}. Keep to the old route.`, "bad");
        skipNextRoute = true;
        from.value = { ...nearest, kind: "ENTRANCE", floor: 1 };
        pathSteps = result.route.steps;
        steps.value = mergeSteps(result.route.steps);
        doneCount.value = 0;
        draw();
        say(`You went off course, so here is a new route from ${nearest.name}.`);
      } finally {
        rerouting = false;
      }
    }
    const nowHour = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
    let skipNextRoute = false;

    const signInFirst = (what: string) => { showSignIn.value = true; say(`Sign in to ${what}.`, "bad"); };
    function startFlag(link: string) {
      if (!me.value) return signInFirst("report a problem");
      flagging.value = flagging.value === link ? "" : link; reason.value = "";
    }
    async function block(link: string) {
      if (!reason.value.trim()) return say("Please say what is wrong.", "bad");
      const result = await client.problems.block({ link, reason: reason.value.trim() });
      if ("error" in result) return say(result.error === "CONFLICT" ? "Someone has already flagged that passage." : result.error === "UNAUTHORIZED" ? "Sign in to report a problem." : `Could not report: ${result.error}`, "bad");
      flagging.value = ""; reason.value = "";
      say("Reported. Directions now avoid that passage.");
      await load(); await findRoute();
    }
    async function unblock(link: string) {
      if (!me.value) return signInFirst("mark a passage clear");
      const result = await client.problems.unblock({ link });
      if ("error" in result) return say(`Could not clear it: ${result.error}`, "bad");
      say("Marked as clear.");
      await load(); await findRoute();
    }

    const isFavorite = (p: Place) => mine.value?.favorites.some((f: Place) => f.place === p.place);
    async function toggleFavorite(p: Place) {
      const result = isFavorite(p) ? await client.me.favorites.remove({ place: p.place }) : await client.me.favorites.add({ place: p.place });
      if ("error" in result) return say(`Could not change favorites: ${result.error}`, "bad");
      await loadMine();
    }
    async function saveTrip() {
      if (!from.value || !to.value) return;
      const result = await client.me.trips.save({ name: tripName.value.trim(), source: from.value.place, destination: to.value.place, accessibleOnly: accessibleOnly.value });
      if ("error" in result) return say(result.error === "CONFLICT" ? "You already have a trip with that name." : "Give the trip a name.", "bad");
      tripName.value = "";
      say("Trip saved.");
      await loadMine();
    }
    function useTrip(t: any) {
      from.value = { place: t.source, name: t.sourceName, kind: "", floor: 0 };
      to.value = { place: t.destination, name: t.destinationName, kind: "", floor: 0 };
      accessibleOnly.value = t.accessibleOnly;
    }
    async function removeTrip(trip: string) {
      await client.me.trips.remove({ trip });
      await loadMine();
    }
    async function savePreferences() {
      await client.me.preferences.set({ stepFree: prefStepFree.value, useLocation: prefLocation.value, units: units.value });
    }
    async function finishTrip() {
      if (!from.value || !to.value || finished.value) return;
      finished.value = true; // one finish per route
      const result = await client.me.trips.finish({ source: from.value.place, destination: to.value.place, meters: Math.round(routeMeters.value) });
      if ("error" in result) { finished.value = false; return say(`Could not record the trip: ${result.error}`, "bad"); }
      say(`Trip recorded: about ${distanceLabel(routeMeters.value)}.`);
      await loadMine();
    }

    watch([from, to, accessibleOnly, time], () => {
      if (skipNextRoute) { skipNextRoute = false; return; } // the reroute already found this route
      message.value = "";
      findRoute();
    });
    onMounted(async () => {
      map = L.map("map").setView(MIT, 16);
      // Tiles get the site's origin as referrer (OSM requires one); the rest of the page sends none.
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        referrerPolicy: "strict-origin-when-cross-origin",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      floorLayer = L.layerGroup().addTo(map); // under the route line
      routeLayer = L.layerGroup().addTo(map);
      map.on("zoomend", () => map.getContainer().classList.toggle("labels", map.getZoom() >= 19));
      if (window.location.pathname === "/auth/commons/callback") await finishCommons();
      else await loadMe();
      if (me.value) { accessibleOnly.value = prefStepFree.value; tracking.value = prefLocation.value; }
      const [start, end] = await Promise.all([placeNamed("Simmons Hall (Building W79)"), placeNamed("32-123 Lecture Hall"), load()]);
      from.value ??= start;
      to.value ??= end;
    });

    return {
      me, mine, showSignIn, creating, choosing, username, password, authError, submitPassword, startCommons, chooseUsername, signOut,
      reports, unreported, steps, from, to, accessibleOnly, time, searched, flagging, reason, message, messageKind, routeMeters, distanceLabel,
      startFlag, block, unblock, tracking, arrivalLabel, tab, sheetOpen, plaque, swap, kinds, nearestKind, closest, findNearest, chooseClosest, units, unitChoices, chooseUnits, inUnits, routeFloors, activeFloor, showFloor, hideFloor, doneCount, isFavorite, toggleFavorite, tripName, saveTrip, useTrip, removeTrip, prefStepFree, prefLocation, savePreferences, finished, finishTrip,
    };
  },
});

// A text box that asks the server for matching places as you type (buildings first).
app.component("PlacePicker", {
  props: { modelValue: { type: Object, default: null }, label: String },
  emits: ["update:modelValue"],
  template: `
    <label class="combo"><span>{{ label }}</span>
      <input type="text" :value="text" :placeholder="label === 'From' ? 'Where are you?' : 'Building, room or place'" autocomplete="off" enterkeyhint="search"
        @focus="onFocus" @input="onInput" @blur="close" @keydown.esc="close" @keydown.enter.prevent="pickFirst" />
      <ul v-if="open" class="options">
        <li v-for="p in pinned" :key="p.place" :class="{ chosen: p.place === modelValue?.place }" @mousedown.prevent="choose(p)">
          <span class="name">{{ p.name }}</span> <span class="floor">{{ floorLabel(p.floor) }}</span>
        </li>
        <li v-if="pinned.length && others.length" class="divider" role="separator"></li>
        <li v-for="p in others" :key="p.place" :class="{ chosen: p.place === modelValue?.place }" @mousedown.prevent="choose(p)">
          <span class="name">{{ p.name }}</span> <span class="floor">{{ floorLabel(p.floor) }}</span>
        </li>
        <li v-if="!results.length" class="none">No matching places</li>
        <li v-else-if="results.length >= 40" class="none">Type more to narrow the list.</li>
      </ul>
    </label>`,
  setup(props: any, { emit }: any) {
    const text = ref("");
    const open = ref(false);
    const results = ref<Place[]>([]);
    // Entrances (buildings and the Simmons lobby) come first from the server, set apart by a divider.
    const pinned = computed(() => results.value.filter((p) => p.kind === "ENTRANCE"));
    const others = computed(() => results.value.filter((p) => p.kind !== "ENTRANCE"));
    watch(() => props.modelValue, (p) => { text.value = p?.name ?? text.value; }, { immediate: true });

    let latest = 0;
    async function search(q: string) {
      const asked = ++latest;
      const result = await client.map.search({ text: q });
      // A slow answer to an older keystroke must not replace a newer one.
      if (asked === latest && !("error" in result)) results.value = result.places.places;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onFocus = (event: Event) => { open.value = true; (event.target as HTMLInputElement).select(); search(""); };
    const onInput = (event: Event) => {
      text.value = (event.target as HTMLInputElement).value;
      open.value = true;
      clearTimeout(timer);
      timer = setTimeout(() => search(text.value), 120);
    };
    const choose = (p: Place) => { emit("update:modelValue", p); text.value = p.name; open.value = false; };
    const pickFirst = () => { const first = pinned.value[0] ?? others.value[0]; if (first) choose(first); };
    const close = () => { open.value = false; text.value = props.modelValue?.name ?? ""; };
    return { text, open, results, pinned, others, floorLabel, onFocus, onInput, choose, pickFirst, close };
  },
});

app.mount("#app");
