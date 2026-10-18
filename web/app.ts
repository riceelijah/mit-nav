import { createApp, ref, computed, watch, onMounted } from "vue/dist/vue.esm-bundler.js";
import { createHttpClient } from "@mit-sdg/sync-engine-http/client";
import type { CampusWireHttp } from "../generated/wire.ts";

const client: any = createHttpClient<CampusWireHttp>({ baseUrl: "/api" });

type Place = { place: string; name: string; kind: string; floor: number };
const floorLabel = (floor: number) => (floor === 0 ? "Basement" : `Floor ${floor}`);
// Route distances are in cost units; an outdoor walk costs 1 + metres/50, so each unit is about 50 m.
const METERS_PER_UNIT = 50;
const distanceLabel = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);

/** The place with exactly this name, found through search (the browser never holds the whole map). */
async function placeNamed(name: string): Promise<Place | null> {
  const result = await client.map.search({ text: name });
  return "error" in result ? null : (result.places.places.find((p: Place) => p.name === name) ?? null);
}

const app = createApp({
  template: `
  <main>
    <header class="top">
      <div>
        <h1>MIT Navigator</h1>
        <p class="sub">Step-by-step directions across MIT, from building to building and floor to floor. If a passage is out of service, flag it and everyone's directions will avoid it.</p>
      </div>
      <div class="who">
        <template v-if="me">
          <span>Signed in as <strong>{{ me }}</strong></span>
          <button @click="signOut">Sign out</button>
        </template>
        <button v-else class="primary" @click="showSignIn = !showSignIn">Sign in</button>
      </div>
    </header>

    <section v-if="choosing" class="signin">
      <h2>Choose a username</h2>
      <p class="sub">Your Commons username is already used here or can't be used. Pick another.</p>
      <form class="row" @submit.prevent="chooseUsername">
        <label>Username <input type="text" v-model="username" autocomplete="username" required /></label>
        <button class="primary" type="submit">Continue</button>
      </form>
      <p v-if="authError" class="msg bad" role="alert">{{ authError }}</p>
    </section>

    <section v-else-if="showSignIn && !me" class="signin">
      <h2>{{ creating ? 'Create an account' : 'Sign in' }}</h2>
      <button class="commons" @click="startCommons">Sign in with your MIT class account (Commons)</button>
      <p class="or">or with a username and password</p>
      <form class="row" @submit.prevent="submitPassword">
        <label>Username
          <input type="text" v-model="username" autocomplete="username" autocapitalize="off" spellcheck="false" required />
          <span v-if="creating" class="hint">3 to 32 letters, digits, _ or -</span>
        </label>
        <label>Password
          <input type="password" v-model="password" :autocomplete="creating ? 'new-password' : 'current-password'" required />
          <span v-if="creating" class="hint">8 to 128 characters</span>
        </label>
        <button class="primary" type="submit">{{ creating ? 'Create account' : 'Sign in' }}</button>
      </form>
      <p class="switch">{{ creating ? 'Have an account?' : 'New here?' }}
        <button class="link" @click="creating = !creating; authError = ''">{{ creating ? 'Sign in' : 'Create an account' }}</button></p>
      <p v-if="authError" class="msg bad" role="alert">{{ authError }}</p>
    </section>

    <section>
      <div class="row">
        <place-picker label="From" v-model="from" />
        <place-picker label="To" v-model="to" />
        <label>Time of day
          <input type="time" v-model="time" />
        </label>
        <label class="check"><input type="checkbox" v-model="accessibleOnly" /> Step-free route only</label>
      </div>
      <div v-if="me && to" class="inline">
        <button @click="toggleFavorite(to)">{{ isFavorite(to) ? '★ Unfavorite' : '☆ Favorite' }} {{ to.name }}</button>
        <template v-if="from">
          <input type="text" v-model="tripName" placeholder="Name this trip, e.g. To class" />
          <button @click="saveTrip">Save trip</button>
        </template>
      </div>
      <p v-if="from && to && from.place === to.place" class="msg">You are already there.</p>
      <p v-else-if="searched && steps.length === 0" class="msg bad">
        No route found{{ accessibleOnly ? ' that avoids stairs, blocked passages and anything closed at this time. Try turning off step-free or changing the time.' : ' that avoids blocked or closed passages at this time.' }}
      </p>
      <template v-if="steps.length">
        <p class="floor">{{ steps.length }} steps, about {{ distanceLabel(routeMeters) }} (estimated)</p>
        <ol class="steps">
          <li v-for="s in steps" :key="s.step">
            {{ s.instruction }} <span class="floor">(arrive: {{ s.placeName }}, floor {{ s.floor }})</span>
            <button class="flag danger" @click="startFlag(s.link)">Flag blocked</button>
            <div v-if="flagging === s.link" class="inline">
              <input type="text" v-model="reason" placeholder="What is wrong? (e.g. elevator out of service)" />
              <button class="primary" @click="block(s.link)">Report</button>
            </div>
          </li>
        </ol>
        <button v-if="me" class="primary arrived" @click="finishTrip" :disabled="finished">{{ finished ? 'Trip recorded' : "I've arrived" }}</button>
      </template>
      <p v-if="message" :class="['msg', messageKind]">{{ message }}</p>
    </section>

    <template v-if="me && mine">
      <h2>Your things</h2>
      <section class="mine">
        <div>
          <h3>Favorites</h3>
          <p v-if="!mine.favorites.length" class="floor">Star a destination to keep it here.</p>
          <ul class="plain">
            <li v-for="f in mine.favorites" :key="f.place">
              <button class="link" @click="to = f">{{ f.name }}</button>
              <button @click="toggleFavorite(f)" aria-label="Unfavorite">★</button>
            </li>
          </ul>
        </div>
        <div>
          <h3>Saved trips</h3>
          <p v-if="!mine.trips.length" class="floor">Pick a start and destination, then save the trip.</p>
          <ul class="plain">
            <li v-for="t in mine.trips" :key="t.trip">
              <button class="link" @click="useTrip(t)">{{ t.name }}</button>
              <span class="floor">{{ t.sourceName }} → {{ t.destinationName }}{{ t.accessibleOnly ? ', step-free' : '' }}</span>
              <button @click="removeTrip(t.trip)" aria-label="Remove trip">✕</button>
            </li>
          </ul>
        </div>
        <div>
          <h3>Preferences</h3>
          <label class="check"><input type="checkbox" v-model="prefStepFree" @change="savePreferences" /> Step-free routes by default</label>
          <label class="check"><input type="checkbox" v-model="prefLocation" @change="savePreferences" /> Use my location</label>
        </div>
        <div>
          <h3>Your travels</h3>
          <p><strong>{{ mine.totals.trips }}</strong> {{ mine.totals.trips === 1 ? 'trip' : 'trips' }}, about <strong>{{ distanceLabel(mine.totals.meters) }}</strong> (estimated)</p>
          <ul class="plain">
            <li v-for="h in mine.history" :key="h.entry"><span>{{ h.sourceName }} → {{ h.destinationName }}</span><span class="floor">{{ distanceLabel(h.meters) }}</span></li>
          </ul>
        </div>
      </section>
    </template>

    <h2>Open problem reports</h2>
    <section>
      <p v-if="!reports.length && !unreported.length" class="sub">Nothing is reported as blocked.</p>
      <ul class="plain">
        <li v-for="r in reports" :key="r.report">
          <span><strong>{{ r.sourceName }} to {{ r.destinationName }}</strong>: {{ r.forward }}<br /><span class="floor">{{ r.reporter ?? 'someone' }}: {{ r.reason }}</span></span>
          <button @click="unblock(r.link)">Mark as clear</button>
        </li>
        <li v-for="l in unreported" :key="l.link">
          <span><strong>{{ l.sourceName }} to {{ l.destinationName }}</strong>: {{ l.forward }}<br /><span class="floor">blocked{{ l.service ? ' with ' + l.service : '' }}</span></span>
          <button @click="unblock(l.link)">Mark as clear</button>
        </li>
      </ul>
    </section>
  </main>`,
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
    const routeMeters = computed(() => steps.value.reduce((sum, s) => sum + s.distance, 0) * METERS_PER_UNIT);
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
    async function findRoute() {
      const asked = ++latestRoute;
      finished.value = false;
      if (!from.value || !to.value || from.value.place === to.value.place) { steps.value = []; searched.value = false; return; }
      const result = await client.route.find({ source: from.value.place, destination: to.value.place, accessibleOnly: accessibleOnly.value, hour: hour.value });
      if (asked !== latestRoute) return; // an answer to an older choice of places
      if ("error" in result) return say(`Could not find a route: ${result.error}`, "bad");
      steps.value = result.route.steps;
      searched.value = true;
    }

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
      await client.me.preferences.set({ stepFree: prefStepFree.value, useLocation: prefLocation.value });
    }
    async function finishTrip() {
      if (!from.value || !to.value || finished.value) return;
      finished.value = true; // one finish per route
      const result = await client.me.trips.finish({ source: from.value.place, destination: to.value.place, meters: Math.round(routeMeters.value) });
      if ("error" in result) { finished.value = false; return say(`Could not record the trip: ${result.error}`, "bad"); }
      say(`Trip recorded: about ${distanceLabel(routeMeters.value)}.`);
      await loadMine();
    }

    watch([from, to, accessibleOnly, time], () => { message.value = ""; findRoute(); });
    onMounted(async () => {
      if (window.location.pathname === "/auth/commons/callback") await finishCommons();
      else await loadMe();
      if (me.value) accessibleOnly.value = prefStepFree.value;
      const [start, end] = await Promise.all([placeNamed("Main Lobby Entrance"), placeNamed("32-123 Lecture Hall"), load()]);
      from.value ??= start;
      to.value ??= end;
    });

    return {
      me, mine, showSignIn, creating, choosing, username, password, authError, submitPassword, startCommons, chooseUsername, signOut,
      reports, unreported, steps, from, to, accessibleOnly, time, searched, flagging, reason, message, messageKind, routeMeters, distanceLabel,
      startFlag, block, unblock, isFavorite, toggleFavorite, tripName, saveTrip, useTrip, removeTrip, prefStepFree, prefLocation, savePreferences, finished, finishTrip,
    };
  },
});

// A text box that asks the server for matching places as you type (buildings first).
app.component("PlacePicker", {
  props: { modelValue: { type: Object, default: null }, label: String },
  emits: ["update:modelValue"],
  template: `
    <label class="combo">{{ label }}
      <input type="text" :value="text" placeholder="Building or room, e.g. 32-123" autocomplete="off"
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
        <li v-else-if="results.length >= 40" class="none">Showing the first 40. Type more to narrow the list.</li>
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
