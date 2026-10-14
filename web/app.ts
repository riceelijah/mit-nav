import { createApp, ref, computed, watch, onMounted } from "vue/dist/vue.esm-bundler.js";
import { createHttpClient } from "@mit-sdg/sync-engine-http/client";
import type { SimmonsWireHttp } from "../generated/wire.ts";

const client = createHttpClient<SimmonsWireHttp>({ baseUrl: "/api" });

function remembered(key: string) {
  try { return localStorage.getItem(key) ?? ""; } catch { return ""; }
}
function remember(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage is optional */ }
}

const floorLabel = (floor: number) => (floor === 0 ? "Basement" : `Floor ${floor}`);
// Sorting is stable, so places on the same floor stay in the order the map lists them (entrance outward).
const byFloor = (a: { floor: number }, b: { floor: number }) => a.floor - b.floor;

const app = createApp({
  template: `
  <main>
    <h1>Simmons Hall Navigator</h1>
    <p class="sub">Step-by-step directions inside Simmons Hall. If a passage is out of service, flag it and everyone's directions will avoid it.</p>

    <section>
      <div class="row">
        <place-picker label="From" v-model="from" :places="pickable" />
        <place-picker label="To" v-model="to" :places="pickable" />
        <label>Time of day
          <input type="time" v-model="time" />
        </label>
        <label class="check"><input type="checkbox" v-model="accessibleOnly" /> Step-free route only</label>
      </div>
      <p v-if="from && from === to" class="msg">You are already there.</p>
      <p v-else-if="searched && steps.length === 0" class="msg bad">
        No route found{{ accessibleOnly ? ' that avoids stairs, blocked passages and anything closed at this time. Try turning off step-free or changing the time.' : ' that avoids blocked or closed passages at this time.' }}
      </p>
      <ol v-if="steps.length" class="steps">
        <li v-for="s in steps" :key="s.step">
          {{ s.instruction }} <span class="floor">(arrive: {{ s.placeName }}, floor {{ s.floor }})</span>
          <button class="flag danger" @click="flagging = flagging === s.link ? '' : s.link; reason = ''">Flag blocked</button>
          <div v-if="flagging === s.link" class="inline">
            <input type="text" v-model="reason" placeholder="What is wrong? (e.g. elevator out of service)" />
            <button class="primary" @click="block(s.link)">Report</button>
          </div>
        </li>
      </ol>
      <p v-if="message" :class="['msg', messageKind]">{{ message }}</p>
    </section>

    <section>
      <label>Your name (attached to reports)
        <input type="text" v-model="reporter" placeholder="Your name" @change="remember('reporter', reporter)" />
      </label>
    </section>

    <h2>Open problem reports</h2>
    <section>
      <p v-if="!reports.length" class="sub">Nothing is reported as blocked.</p>
      <ul class="plain">
        <li v-for="r in reports" :key="r.report">
          <span><strong>{{ linkLabel(r.link) }}</strong><br /><span class="floor">{{ r.reporter }}: {{ r.reason }}</span></span>
          <button @click="unblock(r.link)">Mark as clear</button>
        </li>
      </ul>
    </section>

    <details class="panel">
      <summary>All connections ({{ links.length }})</summary>
      <ul class="plain">
        <li v-for="l in sortedLinks" :key="l.link">
          <span>{{ l.sourceName }} to {{ l.destinationName }} <span class="floor">{{ l.forward }}</span></span>
          <span>
            <span v-if="!l.accessible" class="tag noacc">stairs/steps</span>
            <span v-if="l.closedFrom !== l.closedUntil" class="tag noacc">closed {{ hours(l.closedFrom) }} to {{ hours(l.closedUntil) }}</span>
            <span v-if="l.service" class="tag">{{ l.service }}</span>
            <span v-if="l.blocked" class="tag blocked">blocked</span>
          </span>
        </li>
      </ul>
    </details>
  </main>`,
  setup() {
    const places = ref<{ place: string; name: string; floor: number }[]>([]);
    const links = ref<any[]>([]);
    const reports = ref<any[]>([]);
    const steps = ref<any[]>([]);
    const from = ref("");
    const to = ref("");
    const accessibleOnly = ref(false);
    const now = new Date();
    const time = ref(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    const hour = computed(() => {
      const [h, m] = time.value.split(":").map(Number);
      return (h || 0) + (m || 0) / 60;
    });
    const hours = (h: number) => {
      const wrapped = h % 24;
      const label = wrapped === 0 ? 12 : wrapped > 12 ? wrapped - 12 : wrapped;
      return `${label}${wrapped < 12 ? "am" : "pm"}`;
    };
    const searched = ref(false);
    const flagging = ref("");
    const reason = ref("");
    const reporter = ref(remembered("reporter"));
    const message = ref("");
    const messageKind = ref("ok");

    const pickable = computed(() => places.value.filter((p: any) => p.kind !== "TRANSIT").sort(byFloor));
    const floorByName = computed(() => new Map(places.value.map((p: any) => [p.name, p.floor])));
    const sortedLinks = computed(() =>
      [...links.value].sort(
        (a, b) =>
          (floorByName.value.get(a.sourceName) ?? 0) - (floorByName.value.get(b.sourceName) ?? 0) ||
          a.sourceName.localeCompare(b.sourceName, undefined, { numeric: true }),
      ),
    );

    const linkLabel = (id: string) => {
      const l = links.value.find((x) => x.link === id);
      return l ? `${l.sourceName} to ${l.destinationName}: ${l.forward}` : id;
    };
    const say = (text: string, kind = "ok") => { message.value = text; messageKind.value = kind; };

    async function load() {
      const result = await client.map.overview({});
      if ("error" in result) return say(`Could not load the map: ${result.error}`, "bad");
      places.value = result.overview.places;
      links.value = result.overview.links;
      reports.value = result.problems.reports;
      if (!from.value && pickable.value.length) {
        from.value = places.value.find((p) => p.name === "Main Lobby Entrance")?.place ?? pickable.value[0].place;
        to.value = places.value.find((p) => p.name === "8C")?.place ?? pickable.value[pickable.value.length - 1].place;
      }
    }

    async function findRoute() {
      if (!from.value || !to.value || from.value === to.value) { steps.value = []; searched.value = false; return; }
      const result = await client.route.find({ source: from.value, destination: to.value, accessibleOnly: accessibleOnly.value, hour: hour.value });
      if ("error" in result) return say(`Could not find a route: ${result.error}`, "bad");
      steps.value = result.route.steps;
      searched.value = true;
    }

    async function block(link: string) {
      if (!reporter.value.trim() || !reason.value.trim()) return say("Please enter your name and what is wrong.", "bad");
      const result = await client.problems.block({ link, reporter: reporter.value.trim(), reason: reason.value.trim() });
      if ("error" in result) return say(result.error === "CONFLICT" ? "Someone has already flagged that passage." : `Could not report: ${result.error}`, "bad");
      flagging.value = ""; reason.value = "";
      say("Reported. Directions now avoid that passage.");
      await load(); await findRoute();
    }

    async function unblock(link: string) {
      const result = await client.problems.unblock({ link });
      if ("error" in result) return say(`Could not clear it: ${result.error}`, "bad");
      say("Marked as clear.");
      await load(); await findRoute();
    }

    watch([from, to, accessibleOnly, time], () => { message.value = ""; findRoute(); });
    onMounted(async () => { await load(); await findRoute(); });

    return { places, pickable, sortedLinks, links, reports, steps, from, to, accessibleOnly, time, hours, searched, flagging, reason, reporter, message, messageKind, linkLabel, block, unblock, remember };
  },
});

// A text box whose list of options narrows as you type, with places in floor order.
app.component("PlacePicker", {
  props: { modelValue: { type: String, default: "" }, places: { type: Array, default: () => [] }, label: String },
  emits: ["update:modelValue"],
  template: `
    <label class="combo">{{ label }}
      <input type="text" :value="text" placeholder="Type to search" autocomplete="off"
        @focus="onFocus" @input="onInput" @blur="close" @keydown.esc="close" @keydown.enter.prevent="pickFirst" />
      <ul v-if="open" class="options">
        <li v-for="p in pinned" :key="p.place" :class="{ chosen: p.place === modelValue }" @mousedown.prevent="choose(p)">
          <span class="name">{{ p.name }}</span> <span class="floor">{{ floorLabel(p.floor) }}</span>
        </li>
        <li v-if="pinned.length && others.length" class="divider" role="separator"></li>
        <li v-for="p in others" :key="p.place" :class="{ chosen: p.place === modelValue }" @mousedown.prevent="choose(p)">
          <span class="name">{{ p.name }}</span> <span class="floor">{{ floorLabel(p.floor) }}</span>
        </li>
        <li v-if="!filtered.length" class="none">No matching places</li>
      </ul>
    </label>`,
  setup(props: any, { emit }: any) {
    const text = ref("");
    const open = ref(false);
    const typed = ref(false);
    const selected = computed(() => (props.places as any[]).find((p) => p.place === props.modelValue));
    const filtered = computed(() => {
      const all = [...(props.places as any[])].sort(byFloor);
      const q = text.value.trim().toLowerCase();
      return typed.value && q ? all.filter((p) => p.name.toLowerCase().includes(q)) : all;
    });
    // Entrances (the lobby) are pinned above the rest of the list, set apart by a divider.
    const pinned = computed(() => filtered.value.filter((p) => p.kind === "ENTRANCE"));
    const others = computed(() => filtered.value.filter((p) => p.kind !== "ENTRANCE"));
    watch([() => props.modelValue, () => props.places], () => { text.value = selected.value?.name ?? text.value; }, { immediate: true });

    const onFocus = (event: Event) => { open.value = true; typed.value = false; (event.target as HTMLInputElement).select(); };
    const onInput = (event: Event) => { text.value = (event.target as HTMLInputElement).value; typed.value = true; open.value = true; };
    const choose = (p: any) => { emit("update:modelValue", p.place); text.value = p.name; open.value = false; typed.value = false; };
    const pickFirst = () => { const first = pinned.value[0] ?? others.value[0]; if (first) choose(first); };
    const close = () => { open.value = false; typed.value = false; text.value = selected.value?.name ?? ""; };
    return { text, open, filtered, pinned, others, floorLabel, onFocus, onInput, choose, pickFirst, close };
  },
});

app.mount("#app");
