import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RotateCcw, c as Heart, d as Coins, f as ChevronLeft, i as Settings, l as FastForward, n as Volume2, o as Play, p as BookOpen, s as Pause, t as VolumeX, u as Crosshair } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-6_J10aTm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SELL_RATE = .65;
/** Cells per second / cells of range. Tuned against a 1-cell tile. */
var COSTS = {
	archer: 45,
	cannon: 100
};
var BASE_DAMAGE = {
	archer: 15,
	cannon: 36
};
var BASE_COOLDOWN = {
	archer: .52,
	cannon: 1.18
};
var BASE_RANGE = {
	archer: 3.45,
	cannon: 2.75
};
/** Gold to leave tier 1, 2, and 3. Tier 4 is a specialization, not a stat bump alone. */
var UPGRADE_COSTS = [
	70,
	110,
	165
];
/**
* Spec sheets are 2×2: t-1 frost, t-2 ember, t-3 shadow, t-4 luminous.
* Line sheets t-1…t-4 are the unspecialized tiers.
*/
var SPEC_ORDER = [
	"frost",
	"ember",
	"shadow",
	"luminous"
];
var SPEC_COPY = {
	frost: {
		name: "Frost",
		blurb: "Slows creeps for a few seconds."
	},
	ember: {
		name: "Ember",
		blurb: "Splash and a burning damage over time."
	},
	shadow: {
		name: "Shadow",
		blurb: "Heavy hits, armor pierce, and a curse."
	},
	luminous: {
		name: "Luminous",
		blurb: "Much longer range. Buffs nearby towers."
	}
};
var TOWER_COPY = {
	archer: {
		name: "Archer",
		blurb: "Long range, quick shots."
	},
	cannon: {
		name: "Cannon",
		blurb: "Slow shells that splash."
	}
};
/**
* Winding road, orthogonal and contiguous.
* Enters from the west rift and leaves through the east gate.
*/
var PATH = [
	{
		c: 0,
		r: 1
	},
	{
		c: 1,
		r: 1
	},
	{
		c: 2,
		r: 1
	},
	{
		c: 3,
		r: 1
	},
	{
		c: 4,
		r: 1
	},
	{
		c: 5,
		r: 1
	},
	{
		c: 5,
		r: 2
	},
	{
		c: 5,
		r: 3
	},
	{
		c: 4,
		r: 3
	},
	{
		c: 3,
		r: 3
	},
	{
		c: 2,
		r: 3
	},
	{
		c: 2,
		r: 4
	},
	{
		c: 2,
		r: 5
	},
	{
		c: 3,
		r: 5
	},
	{
		c: 4,
		r: 5
	},
	{
		c: 5,
		r: 5
	},
	{
		c: 6,
		r: 5
	},
	{
		c: 7,
		r: 5
	},
	{
		c: 8,
		r: 5
	},
	{
		c: 9,
		r: 5
	},
	{
		c: 10,
		r: 5
	},
	{
		c: 11,
		r: 5
	}
];
var PATH_KEY = new Set(PATH.map((p) => `${p.c},${p.r}`));
function isPath(c, r) {
	return PATH_KEY.has(`${c},${r}`);
}
function inBounds(c, r) {
	return c >= 0 && r >= 0 && c < 12 && r < 7;
}
var ENEMIES = {
	scout: {
		hp: 44,
		speed: .9,
		gold: 8,
		armor: 0,
		leak: 1,
		radius: .24
	},
	runner: {
		hp: 32,
		speed: 1.5,
		gold: 9,
		armor: 0,
		leak: 1,
		radius: .2
	},
	brute: {
		hp: 128,
		speed: .5,
		gold: 18,
		armor: 4,
		leak: 1,
		radius: .32
	},
	warden: {
		hp: 200,
		speed: .42,
		gold: 26,
		armor: 9,
		leak: 2,
		radius: .32
	},
	titan: {
		hp: 780,
		speed: .32,
		gold: 150,
		armor: 14,
		leak: 4,
		radius: .56
	}
};
/** Wave 12 contains exactly one titan. Callers must not append a second boss. */
function wavePlan(wave) {
	if (wave === 12) return [
		{
			kind: "titan",
			count: 1,
			gap: 1.6
		},
		{
			kind: "warden",
			count: 5,
			gap: .85
		},
		{
			kind: "brute",
			count: 4,
			gap: .7
		}
	];
	if (wave % 4 === 0) return [
		{
			kind: "warden",
			count: 2 + Math.floor(wave / 3),
			gap: .9
		},
		{
			kind: "brute",
			count: 3 + Math.floor(wave / 2),
			gap: .72
		},
		{
			kind: "runner",
			count: 2 + Math.floor(wave / 2),
			gap: .46
		}
	];
	const groups = [{
		kind: "scout",
		count: 5 + wave,
		gap: .58
	}];
	if (wave >= 2) groups.push({
		kind: "runner",
		count: 2 + Math.floor(wave / 2),
		gap: .45
	});
	if (wave >= 3) groups.push({
		kind: "brute",
		count: 1 + Math.floor(wave / 3),
		gap: .82
	});
	if (wave >= 6) groups.push({
		kind: "warden",
		count: 1 + Math.floor((wave - 6) / 2),
		gap: .95
	});
	return groups;
}
function expandWave(wave) {
	const list = [];
	for (const group of wavePlan(wave)) for (let i = 0; i < group.count; i++) list.push({
		kind: group.kind,
		gap: group.gap
	});
	return list;
}
var ENEMY_NAME = {
	scout: "Scout",
	runner: "Runner",
	brute: "Brute",
	warden: "Warden",
	titan: "Titan"
};
function prettyWave(wave) {
	return wavePlan(wave).map((g) => `${g.count} ${ENEMY_NAME[g.kind]}${g.count > 1 ? "s" : ""}`).join(", ");
}
function shotProfile(tower, aura = {
	dmg: 1,
	rate: 1
}) {
	const level = tower.level;
	const grown = 1 + (level - 1) * .65;
	let damage = BASE_DAMAGE[tower.kind] * grown * aura.dmg;
	let cooldown = BASE_COOLDOWN[tower.kind] * (1 - (level - 1) * .08) / Math.max(.2, aura.rate);
	let range = BASE_RANGE[tower.kind] + (level - 1) * .26;
	let splash = tower.kind === "cannon" ? 1.05 : 0;
	let falloff = .58;
	let pen = 0;
	let slowAmt = 0;
	let slowDur = 0;
	let burnDps = 0;
	let burnDur = 0;
	let curseDur = 0;
	const speed = tower.kind === "archer" ? 9.2 : 5.5;
	switch (tower.special) {
		case "frost":
			damage *= .9;
			slowAmt = tower.kind === "archer" ? .5 : .42;
			slowDur = tower.kind === "archer" ? 2.8 : 2.4;
			if (tower.kind === "cannon") splash = 1.2;
			break;
		case "ember":
			damage *= .8;
			burnDps = tower.kind === "cannon" ? 18 : 10;
			burnDur = 3.1;
			if (tower.kind === "archer") {
				splash = .7;
				falloff = .5;
			} else splash = 1.4;
			break;
		case "shadow":
			damage *= 1.55;
			pen = .75;
			curseDur = 3.2;
			if (tower.kind === "cannon") {
				splash = .42;
				falloff = .4;
			}
			break;
		case "luminous":
			damage *= 1.08;
			range *= 1.42;
			cooldown *= .9;
	}
	cooldown = Math.max(.16, cooldown);
	return {
		damage,
		cooldown,
		range,
		speed,
		splash,
		falloff,
		pen,
		slowAmt,
		slowDur,
		burnDps,
		burnDur,
		curseDur
	};
}
function auraFor(selfId, c, r, towers) {
	let n = 0;
	for (const other of towers) {
		if (other.id === selfId || other.special !== "luminous") continue;
		const dx = other.c - c;
		const dy = other.r - r;
		if (dx * dx + dy * dy <= 2.8 * 2.8) n += 1;
	}
	n = Math.min(2, n);
	return {
		dmg: 1 + .1 * n,
		rate: 1 + .15 * n
	};
}
function upgradeCost(level) {
	if (level < 1 || level > 3) return null;
	return UPGRADE_COSTS[level - 1];
}
function sellValue(spent) {
	return Math.floor(spent * SELL_RATE);
}
function artKey(kind, level, special) {
	if (level >= 4 && special) return `${kind}-${special}`;
	return `${kind}-${level}`;
}
function layoutFor(w, h) {
	const marginX = Math.max(12, Math.min(48, w * .04));
	const marginY = Math.max(12, Math.min(40, h * .05));
	const cell = Math.max(8, Math.min((w - marginX * 2) / 12, (h - marginY * 2) / 7));
	const boardW = cell * 12;
	const boardH = cell * 7;
	return {
		cell,
		originX: (w - boardW) / 2,
		originY: (h - boardH) / 2,
		w,
		h
	};
}
function cellCenter(c, r) {
	return {
		x: c + .5,
		y: r + .5
	};
}
function lineArt(kind, level = 1) {
	return `/art/${kind}-line/t-${level}.png?v=2`;
}
function specArt(kind, spec) {
	return `/art/${kind}-spec/t-${Math.max(0, SPEC_ORDER.indexOf(spec)) + 1}.png?v=2`;
}
var CURSE_AMP = 1.22;
var SkySim = class {
	phase = "menu";
	gold = 260;
	lives = 20;
	wave = 0;
	bestWave = 0;
	speed = 1;
	juice = true;
	placing = null;
	selectedId = null;
	towers = [];
	enemies = [];
	shots = [];
	particles = [];
	queue = [];
	spawnTimer = 0;
	waveActive = false;
	message = "";
	messageT = 0;
	trauma = 0;
	hitstop = 0;
	spawnLog = [];
	layout = layoutFor(800, 480);
	hover = null;
	nextId = 1;
	out = [];
	resetRun() {
		this.phase = "play";
		this.gold = 260;
		this.lives = 20;
		this.wave = 0;
		this.speed = 1;
		this.placing = null;
		this.selectedId = null;
		this.towers = [];
		this.enemies = [];
		this.shots = [];
		this.particles = [];
		this.queue = [];
		this.spawnTimer = 0;
		this.waveActive = false;
		this.trauma = 0;
		this.hitstop = 0;
		this.spawnLog = [];
		this.say("Place towers on the grass, then call the wave.");
	}
	say(text) {
		this.message = text;
		this.messageT = 2.4;
	}
	flush() {
		const ev = this.out;
		this.out = [];
		return ev;
	}
	decayJuice(dt) {
		if (this.messageT > 0) this.messageT = Math.max(0, this.messageT - dt);
		this.trauma = Math.max(0, this.trauma - dt * 1.35);
		for (const tower of this.towers) tower.recoil = Math.max(0, tower.recoil - dt * 4);
		if (this.phase !== "play") {
			for (const p of this.particles) {
				p.life -= dt;
				p.x += p.vx * dt;
				p.y += p.vy * dt;
			}
			this.particles = this.particles.filter((p) => p.life > 0);
		}
	}
	step(dt) {
		if (this.phase !== "play") return this.flush();
		if (this.hitstop > 0 && this.juice) {
			const eat = Math.min(this.hitstop, dt);
			this.hitstop -= eat;
			dt -= eat;
			if (dt <= 0) return this.flush();
		}
		if (this.waveActive) this.spawn(dt);
		for (const enemy of this.enemies) {
			if (!enemy.alive) continue;
			enemy.anim += dt;
			enemy.born = Math.min(1, enemy.born + dt * 4.5);
			if (enemy.slowT > 0) enemy.slowT = Math.max(0, enemy.slowT - dt);
			if (enemy.curseT > 0) enemy.curseT = Math.max(0, enemy.curseT - dt);
			if (enemy.flash > 0) enemy.flash = Math.max(0, enemy.flash - dt);
			if (enemy.burnT > 0) {
				const burnDt = Math.min(dt, enemy.burnT);
				enemy.burnT -= burnDt;
				this.hurt(enemy, enemy.burnDps * burnDt, "burn");
			}
			if (!enemy.alive) continue;
			this.advance(enemy, dt);
		}
		for (const tower of this.towers) {
			tower.cooldown -= dt;
			if (tower.cooldown > 0) continue;
			const profile = shotProfile(tower, auraFor(tower.id, tower.c, tower.r, this.towers));
			const target = this.pickTarget(tower, profile.range);
			if (!target) continue;
			this.fire(tower, target, profile);
		}
		for (const shot of this.shots) this.fly(shot, dt);
		this.enemies = this.enemies.filter((e) => e.alive);
		this.shots = this.shots.filter((s) => !s.done);
		this.particles = this.particles.filter((p) => p.life > 0);
		if (this.waveActive && this.queue.length === 0 && this.enemies.length === 0 && this.shots.length === 0) {
			this.waveActive = false;
			if (this.wave >= 12) {
				this.phase = "win";
				this.bestWave = Math.max(this.bestWave, this.wave);
				this.say("The gate still stands.");
				this.out.push({ t: "win" });
			} else {
				const bonus = 6 + this.wave * 2;
				this.gold += bonus;
				this.bestWave = Math.max(this.bestWave, this.wave);
				this.say(`Wave ${this.wave} cleared  +${bonus}`);
				this.out.push({ t: "clear" });
			}
		}
		return this.flush();
	}
	spawn(dt) {
		this.spawnTimer -= dt;
		while (this.queue.length > 0 && this.spawnTimer <= 0) {
			const job = this.queue.shift();
			if (!job) break;
			this.spawnEnemy(job.kind);
			this.spawnTimer += job.gap;
		}
	}
	spawnEnemy(kind, wave = this.wave) {
		const def = ENEMIES[kind];
		const hpScale = 1 + Math.max(0, wave - 1) * .12;
		const speedScale = 1 + Math.max(0, wave - 1) * .016;
		const goldScale = 1 + Math.max(0, wave - 1) * .05;
		const start = cellCenter(PATH[0].c, PATH[0].r);
		const hp = def.hp * hpScale;
		const enemy = {
			id: this.nextId++,
			kind,
			hp,
			maxHp: hp,
			armor: def.armor,
			speed: def.speed * speedScale,
			gold: Math.round(def.gold * goldScale),
			gx: start.x,
			gy: start.y,
			next: 1,
			alive: true,
			slowT: 0,
			slowAmt: 0,
			burnT: 0,
			burnDps: 0,
			curseT: 0,
			flash: 0,
			anim: 0,
			born: 0,
			face: 0,
			leakLives: def.leak,
			radius: def.radius
		};
		this.enemies.push(enemy);
		this.spawnLog.push(kind);
		this.burst(start.x, start.y, kind === "titan" ? "#d38cff" : "#d6c7a1", kind === "titan" ? 16 : 6);
		return enemy;
	}
	advance(enemy, dt) {
		const wp = PATH[enemy.next];
		if (!wp) {
			this.leak(enemy);
			return;
		}
		const dest = cellCenter(wp.c, wp.r);
		const dx = dest.x - enemy.gx;
		const dy = dest.y - enemy.gy;
		const dist = Math.hypot(dx, dy);
		const slow = enemy.slowT > 0 ? 1 - enemy.slowAmt : 1;
		const step = enemy.speed * slow * dt;
		if (dist <= step || dist < .015) {
			enemy.gx = dest.x;
			enemy.gy = dest.y;
			enemy.next += 1;
			if (enemy.next >= PATH.length) this.leak(enemy);
			return;
		}
		enemy.face = Math.atan2(dy, dx);
		enemy.gx += dx / dist * step;
		enemy.gy += dy / dist * step;
	}
	leak(enemy) {
		if (!enemy.alive) return;
		enemy.alive = false;
		this.lives -= enemy.leakLives;
		this.kick(enemy.kind === "titan" ? .55 : .28);
		this.out.push({ t: "leak" });
		this.say(enemy.kind === "titan" ? "The Titan reached the gate" : "A creep escaped");
		if (this.lives <= 0) {
			this.lives = 0;
			this.phase = "lose";
			this.bestWave = Math.max(this.bestWave, Math.max(0, this.wave - 1));
			this.out.push({ t: "lose" });
		}
	}
	pickTarget(tower, range) {
		const origin = cellCenter(tower.c, tower.r);
		const rr = range * range;
		let best = null;
		let bestScore = -Infinity;
		for (const enemy of this.enemies) {
			if (!enemy.alive) continue;
			const dx = enemy.gx - origin.x;
			const dy = enemy.gy - origin.y;
			if (dx * dx + dy * dy > rr) continue;
			const score = this.scoreTarget(tower.targetMode, enemy, dx * dx + dy * dy);
			if (score > bestScore) {
				bestScore = score;
				best = enemy;
			}
		}
		return best;
	}
	scoreTarget(mode, enemy, dist2) {
		if (mode === "closest") return -dist2;
		if (mode === "strongest") return enemy.hp + enemy.maxHp * .01;
		const prev = PATH[Math.max(0, enemy.next - 1)];
		const from = prev ? cellCenter(prev.c, prev.r) : {
			x: enemy.gx,
			y: enemy.gy
		};
		const along = Math.hypot(enemy.gx - from.x, enemy.gy - from.y);
		return enemy.next * 10 + along;
	}
	fire(tower, target, profile) {
		const origin = cellCenter(tower.c, tower.r);
		const dx = target.gx - origin.x;
		const dy = target.gy - origin.y;
		tower.angle = Math.atan2(dy, dx);
		tower.cooldown = profile.cooldown;
		tower.recoil = 1;
		const dist0 = Math.max(.2, Math.hypot(dx, dy));
		this.shots.push({
			kind: tower.kind,
			special: tower.special,
			x: origin.x,
			y: origin.y,
			enemyId: target.id,
			tx: target.gx,
			ty: target.gy,
			speed: profile.speed,
			damage: profile.damage,
			splash: profile.splash,
			falloff: profile.falloff,
			pen: profile.pen,
			slowAmt: profile.slowAmt,
			slowDur: profile.slowDur,
			burnDps: profile.burnDps,
			burnDur: profile.burnDur,
			curseDur: profile.curseDur,
			done: false,
			dist0
		});
		this.out.push({
			t: "shoot",
			kind: tower.kind,
			special: tower.special
		});
	}
	fly(shot, dt) {
		const live = this.enemies.find((e) => e.id === shot.enemyId && e.alive);
		if (live) {
			shot.tx = live.gx;
			shot.ty = live.gy;
		}
		const dx = shot.tx - shot.x;
		const dy = shot.ty - shot.y;
		const dist = Math.hypot(dx, dy);
		const step = shot.speed * dt;
		if (dist <= step + .08) {
			shot.x = shot.tx;
			shot.y = shot.ty;
			this.impact(shot);
			shot.done = true;
			return;
		}
		shot.x += dx / dist * step;
		shot.y += dy / dist * step;
	}
	impact(shot) {
		const victims = [];
		for (const enemy of this.enemies) {
			if (!enemy.alive) continue;
			const dx = enemy.gx - shot.x;
			const dy = enemy.gy - shot.y;
			const d = Math.hypot(dx, dy);
			if (enemy.id === shot.enemyId && d < .45) victims.push({
				enemy,
				direct: true
			});
			else if (shot.splash > 0 && d <= shot.splash) victims.push({
				enemy,
				direct: false
			});
		}
		if (victims.length === 0) {
			const fallback = this.enemies.find((e) => e.id === shot.enemyId && e.alive);
			if (fallback) victims.push({
				enemy: fallback,
				direct: true
			});
		}
		for (const { enemy, direct } of victims) {
			const scale = direct ? 1 : shot.falloff;
			this.applyHit(enemy, shot, scale);
		}
		const color = shotColor(shot.special, shot.kind);
		this.burst(shot.x, shot.y, color, shot.splash > .8 ? 12 : 6);
		if (shot.kind === "cannon") this.kick(.16);
	}
	/** Test seam and combat resolution. `scale` is splash falloff. */
	applyHit(enemy, shot, scale = 1) {
		if (!enemy.alive) return;
		const pen = shot.pen;
		const armor = enemy.armor * (1 - pen);
		let amount = Math.max(.75, shot.damage * scale - armor);
		if (enemy.curseT > 0) amount *= CURSE_AMP;
		if (shot.curseDur > 0) enemy.curseT = Math.max(enemy.curseT, shot.curseDur);
		if (shot.slowDur > 0 && shot.slowAmt > 0) {
			enemy.slowT = Math.max(enemy.slowT, shot.slowDur);
			enemy.slowAmt = Math.max(enemy.slowAmt, shot.slowAmt);
		}
		if (shot.burnDur > 0 && shot.burnDps > 0) {
			const dps = shot.burnDps * (scale < 1 ? .65 : 1);
			if (enemy.burnT <= 0 || dps >= enemy.burnDps) enemy.burnDps = dps;
			enemy.burnT = Math.max(enemy.burnT, shot.burnDur);
		}
		this.hurt(enemy, amount, "hit");
		if (enemy.kind === "titan" || amount >= 28) this.float(enemy.gx, enemy.gy - enemy.radius, String(Math.round(amount)), "#f4ecd8");
	}
	hurt(enemy, amount, cause) {
		if (!enemy.alive || amount <= 0) return;
		enemy.hp -= amount;
		enemy.flash = .08;
		if (cause === "hit" && enemy.kind === "titan") this.kick(.2);
		if (enemy.hp <= 0) this.kill(enemy);
	}
	kill(enemy) {
		if (!enemy.alive) return;
		enemy.alive = false;
		this.gold += enemy.gold;
		this.float(enemy.gx, enemy.gy - .2, `+${enemy.gold}`, "#e7c56a");
		this.burst(enemy.gx, enemy.gy, enemy.kind === "titan" ? "#d38cff" : "#f4ecd8", enemy.kind === "titan" ? 22 : 10);
		this.kick(enemy.kind === "titan" ? .45 : .1);
		if (this.juice) this.hitstop = Math.max(this.hitstop, enemy.kind === "titan" ? .07 : .03);
		this.out.push({
			t: "kill",
			kind: enemy.kind
		});
	}
	boardClick(c, r) {
		if (this.phase !== "play") return this.flush();
		const occupied = this.towers.find((t) => t.c === c && t.r === r);
		if (occupied) {
			this.selectedId = occupied.id;
			this.placing = null;
			return this.flush();
		}
		if (!this.placing) {
			this.selectedId = null;
			return this.flush();
		}
		if (!inBounds(c, r) || isPath(c, r)) {
			this.say(isPath(c, r) ? "The road is for creeps" : "Can't build there");
			this.out.push({ t: "nope" });
			return this.flush();
		}
		const cost = COSTS[this.placing];
		if (this.gold < cost) {
			this.say("Not enough gold");
			this.out.push({ t: "nope" });
			return this.flush();
		}
		this.gold -= cost;
		const tower = {
			id: this.nextId++,
			kind: this.placing,
			c,
			r,
			level: 1,
			special: null,
			cooldown: .25,
			spent: cost,
			targetMode: "first",
			recoil: 0,
			angle: 0
		};
		this.towers.push(tower);
		this.selectedId = tower.id;
		this.placing = null;
		this.say(`${tower.kind === "archer" ? "Archer" : "Cannon"} placed`);
		this.out.push({ t: "place" });
		this.burst(c + .5, r + .5, "#e7c56a", 8);
		return this.flush();
	}
	upgradeSelected() {
		const tower = this.selected();
		if (!tower || this.phase !== "play") return this.flush();
		if (tower.level >= 4) {
			this.say("This tower is fully ascended");
			return this.flush();
		}
		if (tower.level === 3) {
			this.say("Choose a specialization");
			return this.flush();
		}
		const cost = upgradeCost(tower.level);
		if (cost == null) return this.flush();
		if (this.gold < cost) {
			this.say("Not enough gold");
			this.out.push({ t: "nope" });
			return this.flush();
		}
		this.gold -= cost;
		tower.level += 1;
		tower.spent += cost;
		this.say(`Tier ${tower.level}`);
		this.burst(tower.c + .5, tower.r + .5, "#e7c56a", 12);
		this.out.push({ t: "upgrade" });
		return this.flush();
	}
	specialize(special) {
		const tower = this.selected();
		if (!tower || this.phase !== "play") return this.flush();
		if (tower.level !== 3 || tower.special) {
			this.say("Specializations open at the fourth tier");
			return this.flush();
		}
		const cost = upgradeCost(3);
		if (cost == null) return this.flush();
		if (this.gold < cost) {
			this.say("Not enough gold");
			this.out.push({ t: "nope" });
			return this.flush();
		}
		this.gold -= cost;
		tower.level = 4;
		tower.special = special;
		tower.spent += cost;
		this.say(`${labelSpecial(special)} awakened`);
		this.burst(tower.c + .5, tower.r + .5, shotColor(special, tower.kind), 16);
		this.out.push({ t: "upgrade" });
		return this.flush();
	}
	sellSelected() {
		const tower = this.selected();
		if (!tower || this.phase !== "play") return this.flush();
		const refund = sellValue(tower.spent);
		this.gold += refund;
		this.towers = this.towers.filter((t) => t.id !== tower.id);
		this.selectedId = null;
		this.say(`Sold for ${refund}`);
		this.out.push({ t: "sell" });
		return this.flush();
	}
	cycleTarget() {
		const tower = this.selected();
		if (!tower) return;
		const order = [
			"first",
			"closest",
			"strongest"
		];
		tower.targetMode = order[(order.indexOf(tower.targetMode) + 1) % order.length] ?? "first";
	}
	startWave() {
		if (this.phase !== "play" || this.waveActive || this.wave >= 12) return false;
		this.wave += 1;
		this.queue = expandWave(this.wave);
		this.spawnTimer = .35;
		this.waveActive = true;
		this.say(this.wave === 12 ? "The Titan wakes" : `Wave ${this.wave}`);
		this.out.push({ t: "wave" });
		return true;
	}
	hoverAt(px, py) {
		const c = Math.floor((px - this.layout.originX) / this.layout.cell);
		const r = Math.floor((py - this.layout.originY) / this.layout.cell);
		if (!inBounds(c, r)) {
			this.hover = null;
			return;
		}
		this.hover = {
			c,
			r
		};
	}
	clickAt(px, py) {
		const c = Math.floor((px - this.layout.originX) / this.layout.cell);
		const r = Math.floor((py - this.layout.originY) / this.layout.cell);
		if (!inBounds(c, r)) {
			this.selectedId = null;
			return this.flush();
		}
		return this.boardClick(c, r);
	}
	selected() {
		return this.towers.find((t) => t.id === this.selectedId) ?? null;
	}
	canBuild(c, r) {
		if (!inBounds(c, r) || isPath(c, r)) return false;
		return !this.towers.some((t) => t.c === c && t.r === r);
	}
	hud() {
		const selected = this.selected();
		let selectedHud = null;
		if (selected) {
			const profile = shotProfile(selected, auraFor(selected.id, selected.c, selected.r, this.towers));
			selectedHud = {
				id: selected.id,
				kind: selected.kind,
				level: selected.level,
				special: selected.special,
				spent: selected.spent,
				targetMode: selected.targetMode,
				damage: profile.damage,
				rate: 1 / profile.cooldown,
				range: profile.range,
				upgradeCost: upgradeCost(selected.level)
			};
		}
		const next = this.wave >= 12 ? "" : prettyWave(this.wave + 1);
		return {
			phase: this.phase,
			gold: this.gold,
			lives: this.lives,
			wave: this.wave,
			bestWave: this.bestWave,
			speed: this.speed,
			placing: this.placing,
			selected: selectedHud,
			waveActive: this.waveActive,
			message: this.messageT > 0 ? this.message : "",
			enemyCount: this.enemies.length,
			nextLabel: next,
			fieldLabel: this.waveActive ? `${this.enemies.length} on the road` : "Road is clear"
		};
	}
	fingerprint() {
		const s = this.selected();
		return [
			this.phase,
			this.gold,
			this.lives,
			this.wave,
			this.bestWave,
			this.speed,
			this.placing ?? "-",
			s ? `${s.id}:${s.level}:${s.special}:${s.targetMode}` : "-",
			this.waveActive ? 1 : 0,
			this.messageT > 0 ? this.message : "",
			this.enemies.length,
			this.towers.length
		].join("|");
	}
	rangeOf(tower) {
		return shotProfile(tower, auraFor(tower.id, tower.c, tower.r, this.towers)).range;
	}
	kick(amount) {
		if (!this.juice) return;
		this.trauma = Math.min(1, this.trauma + amount);
	}
	burst(x, y, color, count) {
		for (let i = 0; i < count; i++) {
			if (this.particles.length > 280) this.particles.shift();
			const a = Math.random() * Math.PI * 2;
			const s = .4 + Math.random() * 1.4;
			this.particles.push({
				x,
				y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s - .2,
				life: .25 + Math.random() * .35,
				max: .6,
				size: .06 + Math.random() * .08,
				color
			});
		}
	}
	float(x, y, text, color) {
		if (this.particles.length > 280) this.particles.shift();
		this.particles.push({
			x,
			y,
			vx: 0,
			vy: -.45,
			life: .8,
			max: .8,
			size: .22,
			color,
			text
		});
	}
};
function shotColor(special, kind) {
	if (special === "frost") return "#8fd4ff";
	if (special === "ember") return "#ff8a3d";
	if (special === "shadow") return "#c084fc";
	if (special === "luminous") return "#ffe08a";
	return kind === "archer" ? "#f3e2b0" : "#e38b4a";
}
function labelSpecial(special) {
	if (special === "frost") return "Frost";
	if (special === "ember") return "Ember";
	if (special === "shadow") return "Shadow";
	return "Luminous";
}
function ghostRange(kind) {
	return BASE_RANGE[kind];
}
var STAR_SEED = 20261029;
function drawWorld(ctx, sim, art, time) {
	const { layout } = sim;
	const mag = sim.juice ? sim.trauma * sim.trauma * Math.min(12, layout.cell * .2) : 0;
	ctx.save();
	ctx.translate(Math.sin(time * 46) * mag, Math.cos(time * 37) * mag);
	sky(ctx, layout, time);
	marginIsles(ctx, layout, time);
	island(ctx, layout);
	grass(ctx, layout, sim, time);
	road(ctx, layout, time);
	markers(ctx, layout, time);
	if (sim.placing && sim.hover && sim.phase === "play") drawRange(ctx, layout, sim.hover.c + .5, sim.hover.r + .5, ghostRange(sim.placing), sim.canBuild(sim.hover.c, sim.hover.r));
	const selected = sim.selected();
	if (selected && sim.phase !== "menu") {
		drawRange(ctx, layout, selected.c + .5, selected.r + .5, sim.rangeOf(selected), true);
		auraLinks(ctx, layout, sim, selected);
	}
	const sprites = [];
	for (const tower of sim.towers) sprites.push({
		y: tower.r + .5,
		paint: () => drawTower(ctx, layout, art, tower, tower.id === sim.selectedId)
	});
	if (sim.placing && sim.hover && sim.phase === "play") {
		const ok = sim.canBuild(sim.hover.c, sim.hover.r) && sim.gold >= costOf(sim.placing);
		sprites.push({
			y: sim.hover.r + .55,
			paint: () => drawGhost(ctx, layout, art, sim.placing, sim.hover.c, sim.hover.r, ok)
		});
	}
	for (const enemy of sim.enemies) {
		if (!enemy.alive) continue;
		sprites.push({
			y: enemy.gy,
			paint: () => drawEnemy(ctx, layout, enemy)
		});
	}
	sprites.sort((a, b) => a.y - b.y);
	for (const sprite of sprites) sprite.paint();
	for (const shot of sim.shots) drawShot(ctx, layout, shot, time);
	for (const p of sim.particles) drawParticle(ctx, layout, p);
	vignette(ctx, layout);
	ctx.restore();
}
function costOf(kind) {
	return kind === "archer" ? 45 : 100;
}
function sky(ctx, layout, time) {
	const g = ctx.createLinearGradient(0, 0, 0, layout.h);
	g.addColorStop(0, "#070b18");
	g.addColorStop(.45, "#14203a");
	g.addColorStop(1, "#1b3048");
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, layout.w, layout.h);
	const rnd = mulberry(STAR_SEED);
	for (let i = 0; i < 70; i++) {
		const x = rnd() * layout.w;
		const y = rnd() * layout.h * .72;
		ctx.globalAlpha = .25 + (.35 + .65 * (.5 + .5 * Math.sin(time * 2 + i))) * .55;
		ctx.fillStyle = i % 7 === 0 ? "#ffe08a" : "#d5def2";
		ctx.beginPath();
		ctx.arc(x, y, i % 11 === 0 ? 1.6 : 1, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
	drawCloud(ctx, layout, time * 8, .18, .22, .9);
	drawCloud(ctx, layout, time * 5 + 200, .62, .12, .7);
	drawCloud(ctx, layout, time * 6 + 80, .4, .78, .45);
}
function drawCloud(ctx, layout, drift, yNorm, scale, alpha) {
	const w = layout.w + 240;
	const x = drift * 18 % w - 120;
	const y = yNorm * layout.h;
	ctx.save();
	ctx.globalAlpha = alpha * .28;
	ctx.fillStyle = "#c9d7ef";
	const s = layout.cell * scale;
	ctx.beginPath();
	ctx.ellipse(x, y, s * 1.8, s * .55, 0, 0, Math.PI * 2);
	ctx.ellipse(x + s * .9, y + s * .1, s * 1.2, s * .42, 0, 0, Math.PI * 2);
	ctx.ellipse(x - s * .8, y + s * .12, s, s * .36, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function marginIsles(ctx, layout, time) {
	const bob = Math.sin(time * .6) * 4;
	const spots = [
		{
			x: layout.w * .08,
			y: layout.h * .16 + bob,
			s: layout.cell * 1.4
		},
		{
			x: layout.w * .9,
			y: layout.h * .14 - bob,
			s: layout.cell * 1.1
		},
		{
			x: layout.w * .84,
			y: layout.h * .86 + bob,
			s: layout.cell * 1.3
		}
	];
	for (const spot of spots) {
		if (spot.x > layout.originX - 10 && spot.x < layout.originX + 12 * layout.cell + 10 && spot.y > layout.originY - 10 && spot.y < layout.originY + 7 * layout.cell + 20) continue;
		ctx.fillStyle = "rgba(0,0,0,0.25)";
		ctx.beginPath();
		ctx.ellipse(spot.x, spot.y + spot.s * .45, spot.s * .9, spot.s * .22, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#243044";
		ctx.beginPath();
		ctx.ellipse(spot.x, spot.y, spot.s, spot.s * .42, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#3e6a48";
		ctx.beginPath();
		ctx.ellipse(spot.x, spot.y - spot.s * .08, spot.s * .82, spot.s * .28, 0, 0, Math.PI * 2);
		ctx.fill();
	}
}
function island(ctx, layout) {
	const cell = layout.cell;
	const x = layout.originX - cell * .18;
	const y = layout.originY - cell * .08;
	const w = 12 * cell + cell * .36;
	const h = 7 * cell + cell * .62;
	ctx.fillStyle = "rgba(0,0,0,0.28)";
	roundRect(ctx, x + cell * .12, y + cell * .45, w, h, cell * .28);
	ctx.fill();
	const rock = ctx.createLinearGradient(x, y, x, y + h);
	rock.addColorStop(0, "#4a3424");
	rock.addColorStop(.35, "#2a1c12");
	rock.addColorStop(1, "#140e0a");
	ctx.fillStyle = rock;
	roundRect(ctx, x, y + cell * .22, w, h, cell * .26);
	ctx.fill();
	ctx.fillStyle = "#5a4632";
	roundRect(ctx, x, y, w, 7 * cell + cell * .16, cell * .22);
	ctx.fill();
}
function grass(ctx, layout, sim, time) {
	const cell = layout.cell;
	for (let r = 0; r < 7; r++) for (let c = 0; c < 12; c++) {
		if (isPath(c, r)) continue;
		const x = layout.originX + c * cell;
		const y = layout.originY + r * cell;
		const n = hash(c, r);
		const shade = n % 3;
		ctx.fillStyle = shade === 0 ? "#3d6b46" : shade === 1 ? "#46784e" : "#356243";
		roundRect(ctx, x + 1.5, y + 1.5, cell - 3, cell - 3, Math.min(8, cell * .16));
		ctx.fill();
		ctx.fillStyle = "rgba(255,255,255,0.05)";
		ctx.fillRect(x + 4, y + 4, cell * .35, 2);
		if (n % 5 === 0) {
			ctx.fillStyle = n % 2 === 0 ? "#d7e38a" : "#f1c1d4";
			ctx.beginPath();
			ctx.arc(x + cell * .72, y + cell * .68, Math.max(1.2, cell * .035), 0, Math.PI * 2);
			ctx.fill();
		}
		if (sim.placing && sim.phase === "play" && sim.canBuild(c, r)) {
			ctx.fillStyle = `rgba(231,197,106,${.18 + .1 * Math.sin(time * 3 + c)})`;
			ctx.beginPath();
			ctx.arc(x + cell / 2, y + cell / 2, Math.max(2, cell * .06), 0, Math.PI * 2);
			ctx.fill();
		}
	}
	if (sim.hover && sim.phase === "play") {
		const { c, r } = sim.hover;
		const x = layout.originX + c * layout.cell;
		const y = layout.originY + r * layout.cell;
		ctx.strokeStyle = (sim.placing ? sim.canBuild(c, r) : !isPath(c, r)) ? "rgba(231,197,106,0.9)" : "rgba(224,122,114,0.9)";
		ctx.lineWidth = 2;
		roundRect(ctx, x + 2, y + 2, layout.cell - 4, layout.cell - 4, 6);
		ctx.stroke();
	}
}
function road(ctx, layout, time) {
	const pts = PATH.map((p) => {
		const center = cellCenter(p.c, p.r);
		return {
			x: layout.originX + center.x * layout.cell,
			y: layout.originY + center.y * layout.cell
		};
	});
	strokePath(ctx, pts, layout.cell * .82, "#5c4128");
	strokePath(ctx, pts, layout.cell * .64, "#c6a36a");
	strokePath(ctx, pts, layout.cell * .1, "rgba(255,236,206,0.35)");
	ctx.fillStyle = "rgba(90,60,30,0.35)";
	for (let i = 0; i < pts.length; i += 2) {
		const p = pts[i];
		if (!p) continue;
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(i % 4 * .2);
		ctx.fillRect(-layout.cell * .08, -2, layout.cell * .16, 3);
		ctx.restore();
	}
}
function markers(ctx, layout, time) {
	const start = cellCenter(PATH[0].c, PATH[0].r);
	const end = cellCenter(PATH[PATH.length - 1].c, PATH[PATH.length - 1].r);
	const sx = layout.originX + start.x * layout.cell;
	const sy = layout.originY + start.y * layout.cell;
	const ex = layout.originX + end.x * layout.cell;
	const ey = layout.originY + end.y * layout.cell;
	const spin = time * 1.6;
	ctx.save();
	ctx.translate(sx, sy);
	ctx.strokeStyle = "rgba(143,212,255,0.85)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(0, 0, layout.cell * .28, spin, spin + 2.2);
	ctx.stroke();
	ctx.strokeStyle = "rgba(192,132,252,0.8)";
	ctx.beginPath();
	ctx.arc(0, 0, layout.cell * .18, -spin, -spin + 1.8);
	ctx.stroke();
	ctx.fillStyle = "#d5def2";
	ctx.font = `600 ${Math.max(10, layout.cell * .16)}px Outfit, sans-serif`;
	ctx.textAlign = "center";
	ctx.fillText("RIFT", 0, -layout.cell * .42);
	ctx.restore();
	ctx.save();
	ctx.translate(ex, ey);
	const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, layout.cell * .55);
	glow.addColorStop(0, "rgba(255,224,138,0.85)");
	glow.addColorStop(1, "rgba(255,224,138,0)");
	ctx.fillStyle = glow;
	ctx.beginPath();
	ctx.arc(0, 0, layout.cell * .55, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "#f4ecd8";
	ctx.beginPath();
	ctx.moveTo(0, -layout.cell * .34);
	ctx.lineTo(layout.cell * .12, 0);
	ctx.lineTo(0, layout.cell * .16);
	ctx.lineTo(-layout.cell * .12, 0);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#e7c56a";
	ctx.font = `600 ${Math.max(10, layout.cell * .16)}px Outfit, sans-serif`;
	ctx.textAlign = "center";
	ctx.fillText("GATE", 0, -layout.cell * .42);
	ctx.restore();
}
function drawRange(ctx, layout, gx, gy, range, ok) {
	const x = layout.originX + gx * layout.cell;
	const y = layout.originY + gy * layout.cell;
	ctx.beginPath();
	ctx.arc(x, y, range * layout.cell, 0, Math.PI * 2);
	ctx.fillStyle = ok ? "rgba(231,197,106,0.1)" : "rgba(224,122,114,0.1)";
	ctx.fill();
	ctx.strokeStyle = ok ? "rgba(231,197,106,0.55)" : "rgba(224,122,114,0.6)";
	ctx.lineWidth = 2;
	ctx.stroke();
}
function auraLinks(ctx, layout, sim, tower) {
	if (tower.special !== "luminous") return;
	ctx.strokeStyle = "rgba(255,224,138,0.45)";
	ctx.lineWidth = 1.5;
	const a = toPx(layout, tower.c + .5, tower.r + .5);
	for (const other of sim.towers) {
		if (other.id === tower.id) continue;
		const dx = other.c - tower.c;
		const dy = other.r - tower.r;
		if (dx * dx + dy * dy > 2.8 * 2.8) continue;
		const b = toPx(layout, other.c + .5, other.r + .5);
		ctx.beginPath();
		ctx.moveTo(a.x, a.y);
		ctx.lineTo(b.x, b.y);
		ctx.stroke();
	}
}
function drawTower(ctx, layout, art, tower, selected) {
	const p = toPx(layout, tower.c + .5, tower.r + .5);
	const size = layout.cell * (1.18 - tower.recoil * .04);
	ctx.save();
	ctx.translate(p.x, p.y + tower.recoil * layout.cell * .03);
	ctx.fillStyle = "rgba(0,0,0,0.25)";
	ctx.beginPath();
	ctx.ellipse(0, layout.cell * .28, layout.cell * .28, layout.cell * .1, 0, 0, Math.PI * 2);
	ctx.fill();
	if (tower.special) {
		ctx.fillStyle = shotColor(tower.special, tower.kind);
		ctx.globalAlpha = .22;
		ctx.beginPath();
		ctx.arc(0, layout.cell * .05, layout.cell * .42, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = 1;
	}
	const img = art.get(artKey(tower.kind, tower.level, tower.special));
	if (img) ctx.drawImage(img, -size / 2, -size / 2, size, size);
	else placeholderTower(ctx, layout.cell, tower.kind);
	if (selected) {
		ctx.strokeStyle = "rgba(244,236,216,0.85)";
		ctx.lineWidth = 2;
		ctx.strokeRect(-size * .42, -size * .46, size * .84, size * .9);
	}
	const badge = layout.cell * .18;
	ctx.fillStyle = "#10182c";
	ctx.beginPath();
	ctx.arc(size * .32, -size * .32, badge, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "#e7c56a";
	ctx.font = `700 ${Math.max(9, badge)}px Outfit, sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(String(tower.level), size * .32, -size * .32);
	ctx.restore();
}
function drawGhost(ctx, layout, art, kind, c, r, ok) {
	const p = toPx(layout, c + .5, r + .5);
	const size = layout.cell * 1.12;
	ctx.save();
	ctx.globalAlpha = ok ? .62 : .4;
	const img = art.get(artKey(kind, 1, null));
	if (img) ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size);
	if (!ok) {
		ctx.globalAlpha = .85;
		ctx.strokeStyle = "#e07a72";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(p.x - size * .2, p.y - size * .2);
		ctx.lineTo(p.x + size * .2, p.y + size * .2);
		ctx.moveTo(p.x + size * .2, p.y - size * .2);
		ctx.lineTo(p.x - size * .2, p.y + size * .2);
		ctx.stroke();
	}
	ctx.restore();
}
function drawEnemy(ctx, layout, enemy) {
	const p = toPx(layout, enemy.gx, enemy.gy);
	const s = layout.cell * enemy.radius * (.72 + .28 * easeOut(enemy.born));
	ctx.save();
	ctx.translate(p.x, p.y);
	ctx.rotate(enemy.face);
	if (enemy.flash > 0) ctx.globalAlpha = .85;
	ctx.fillStyle = "rgba(0,0,0,0.25)";
	ctx.beginPath();
	ctx.ellipse(0, s * .85, s * .9, s * .35, 0, 0, Math.PI * 2);
	ctx.fill();
	paintCreature(ctx, enemy.kind, s, enemy.anim, enemy.slowT > 0, enemy.burnT > 0, enemy.curseT > 0);
	if (enemy.flash > 0) {
		ctx.globalAlpha = .45;
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.arc(0, 0, s, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
	const bw = Math.max(16, s * 2.4);
	const ratio = Math.max(0, enemy.hp / enemy.maxHp);
	const bx = p.x - bw / 2;
	const by = p.y - s - layout.cell * .22;
	ctx.fillStyle = "rgba(7,11,22,0.7)";
	ctx.fillRect(bx, by, bw, 4);
	ctx.fillStyle = ratio > .45 ? "#8fce7a" : "#e07a72";
	ctx.fillRect(bx, by, bw * ratio, 4);
	if (enemy.kind === "titan") {
		ctx.fillStyle = "#f4ecd8";
		ctx.font = `700 ${Math.max(10, layout.cell * .2)}px Cinzel, serif`;
		ctx.textAlign = "center";
		ctx.fillText("TITAN", p.x, by - 4);
	}
}
function paintCreature(ctx, kind, s, anim, slow, burn, curse) {
	const flap = Math.sin(anim * (kind === "runner" ? 14 : 8)) * .35;
	if (kind === "scout") {
		ctx.fillStyle = "rgba(143,212,255,0.45)";
		wing(ctx, -s * .2, flap, s);
		wing(ctx, s * .2, -flap, s);
		ctx.fillStyle = "#d7f1ff";
		ctx.beginPath();
		ctx.ellipse(0, 0, s * .55, s * .7, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#1b3c55";
		eye(ctx, -s * .16, -s * .05, s * .12);
		eye(ctx, s * .16, -s * .05, s * .12);
	} else if (kind === "runner") {
		ctx.fillStyle = "#f0c14a";
		ctx.beginPath();
		ctx.moveTo(s * 1.15, 0);
		ctx.lineTo(-s * .7, s * .45);
		ctx.lineTo(-s * .2, 0);
		ctx.lineTo(-s * .7, -s * .45);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "#fff4cc";
		ctx.beginPath();
		ctx.arc(s * .35, 0, s * .22, 0, Math.PI * 2);
		ctx.fill();
	} else if (kind === "brute") {
		ctx.fillStyle = "#a86850";
		roundRect(ctx, -s * .7, -s * .55, s * 1.4, s * 1.15, s * .3);
		ctx.fill();
		ctx.fillStyle = "#6a3b2e";
		ctx.fillRect(-s * .15, -s * .9, s * .3, s * .4);
		ctx.fillStyle = "#2a140f";
		eye(ctx, -s * .22, -s * .05, s * .1);
		eye(ctx, s * .22, -s * .05, s * .1);
	} else if (kind === "warden") {
		ctx.fillStyle = "#9aadc8";
		ctx.beginPath();
		ctx.moveTo(0, -s);
		ctx.lineTo(s * .85, -s * .1);
		ctx.lineTo(s * .55, s * .85);
		ctx.lineTo(-s * .55, s * .85);
		ctx.lineTo(-s * .85, -s * .1);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "#243044";
		ctx.beginPath();
		ctx.arc(0, -s * .15, s * .28, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#e7c56a";
		ctx.fillRect(-s * .08, -s * .95, s * .16, s * .28);
	} else {
		ctx.fillStyle = "rgba(192,132,252,0.35)";
		wing(ctx, -s * .1, flap * .6, s * 1.3);
		wing(ctx, s * .15, -flap * .6, s * 1.3);
		ctx.fillStyle = "#6e4d88";
		ctx.beginPath();
		ctx.ellipse(-s * .55, s * .1, s * .7, s * .48, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#b794d6";
		ctx.beginPath();
		ctx.ellipse(s * .25, 0, s * .85, s * .62, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#1a1024";
		ctx.beginPath();
		ctx.arc(s * .45, -s * .05, s * .18, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#f4ecd8";
		ctx.beginPath();
		ctx.arc(s * .5, -s * .05, s * .07, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "#e7c56a";
		ctx.lineWidth = Math.max(1.5, s * .08);
		ctx.beginPath();
		ctx.moveTo(s * .15, -s * .55);
		ctx.lineTo(s * .35, -s * .95);
		ctx.moveTo(s * .45, -s * .6);
		ctx.lineTo(s * .7, -s * 1.05);
		ctx.stroke();
	}
	if (slow) ring(ctx, s, "#8fd4ff");
	if (burn) ring(ctx, s * 1.15, "#ff8a3d");
	if (curse) ring(ctx, s * 1.3, "#c084fc");
}
function wing(ctx, x, flap, s) {
	ctx.beginPath();
	ctx.ellipse(x, -s * .15, s * .7, s * .28, flap, 0, Math.PI * 2);
	ctx.fill();
}
function eye(ctx, x, y, r) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
}
function ring(ctx, s, color) {
	ctx.strokeStyle = color;
	ctx.globalAlpha = .85;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(0, 0, s * 1.05, 0, Math.PI * 2);
	ctx.stroke();
	ctx.globalAlpha = 1;
}
function drawShot(ctx, layout, shot, time) {
	const from = toPx(layout, shot.x, shot.y);
	let yLift = 0;
	if (shot.kind === "cannon") {
		const left = Math.hypot(shot.tx - shot.x, shot.ty - shot.y);
		const t = 1 - Math.min(1, left / shot.dist0);
		yLift = Math.sin(t * Math.PI) * layout.cell * .45;
	}
	const color = shotColor(shot.special, shot.kind);
	ctx.save();
	ctx.translate(from.x, from.y - yLift);
	ctx.fillStyle = color;
	ctx.shadowColor = color;
	ctx.shadowBlur = 8;
	ctx.beginPath();
	ctx.arc(0, 0, shot.kind === "cannon" ? Math.max(4, layout.cell * .09) : Math.max(2.5, layout.cell * .05), 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawParticle(ctx, layout, p) {
	const pos = toPx(layout, p.x, p.y);
	const alpha = Math.max(0, Math.min(1, p.life / p.max));
	ctx.save();
	ctx.globalAlpha = alpha;
	if (p.text) {
		ctx.fillStyle = p.color;
		ctx.font = `700 ${Math.max(12, layout.cell * .28)}px Outfit, sans-serif`;
		ctx.textAlign = "center";
		ctx.fillText(p.text, pos.x, pos.y);
	} else {
		ctx.fillStyle = p.color;
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, Math.max(1.5, p.size * layout.cell), 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
function vignette(ctx, layout) {
	const g = ctx.createRadialGradient(layout.w / 2, layout.h / 2, layout.w * .2, layout.w / 2, layout.h / 2, layout.w * .72);
	g.addColorStop(0, "rgba(0,0,0,0)");
	g.addColorStop(1, "rgba(0,0,0,0.28)");
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, layout.w, layout.h);
}
function placeholderTower(ctx, cell, kind) {
	ctx.fillStyle = kind === "archer" ? "#8d6230" : "#5c5146";
	ctx.fillRect(-cell * .16, -cell * .28, cell * .32, cell * .4);
}
function toPx(layout, gx, gy) {
	return {
		x: layout.originX + gx * layout.cell,
		y: layout.originY + gy * layout.cell
	};
}
function strokePath(ctx, pts, width, color) {
	if (pts.length < 2) return;
	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);
	for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.stroke();
}
function roundRect(ctx, x, y, w, h, r) {
	const rad = Math.max(0, Math.min(r, w / 2, h / 2));
	ctx.beginPath();
	ctx.moveTo(x + rad, y);
	ctx.arcTo(x + w, y, x + w, y + h, rad);
	ctx.arcTo(x + w, y + h, x, y + h, rad);
	ctx.arcTo(x, y + h, x, y, rad);
	ctx.arcTo(x, y, x + w, y, rad);
	ctx.closePath();
}
function hash(c, r) {
	return (c * 37 + r * 17 + 11) * 13 & 255;
}
function easeOut(t) {
	return 1 - (1 - t) * (1 - t);
}
function mulberry(seed) {
	let s = seed >>> 0;
	return () => {
		s = s + 1831565813 >>> 0;
		let t = Math.imul(s ^ s >>> 15, 1 | s);
		t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var PENTA = [
	196,
	233.08,
	261.63,
	293.66,
	349.23,
	392
];
var Soundscape = class {
	ctx = null;
	musicGain = null;
	sfxGain = null;
	nextNote = 0;
	step = 0;
	musicVol = .35;
	sfxVol = .8;
	muted = false;
	unlock() {
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!AC) return;
		if (!this.ctx) {
			this.ctx = new AC({ latencyHint: "interactive" });
			this.musicGain = this.ctx.createGain();
			this.sfxGain = this.ctx.createGain();
			this.musicGain.connect(this.ctx.destination);
			this.sfxGain.connect(this.ctx.destination);
			this.applyGains();
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	setMix(mix) {
		this.musicVol = clampVol(mix.music);
		this.sfxVol = clampVol(mix.sfx);
		this.muted = mix.muted;
		this.applyGains();
	}
	preview() {
		if (this.muted || this.sfxVol <= 0) return;
		this.unlock();
		this.tone(this.sfxGain, 660, .08, "sine", .05);
	}
	tick() {
		if (!this.ctx || !this.musicGain || this.muted || this.musicVol <= 0) return;
		if (this.ctx.state !== "running") return;
		const now = this.ctx.currentTime;
		if (this.nextNote === 0) this.nextNote = now + .2;
		if (now + .05 < this.nextNote) return;
		const freq = PENTA[this.step % PENTA.length] ?? 220;
		this.step += 1;
		this.tone(this.musicGain, freq, .45, "sine", .02, now);
		this.nextNote += .62;
	}
	play(event) {
		if (this.muted || this.sfxVol <= 0) return;
		this.unlock();
		const jitter = .94 + Math.random() * .12;
		const bus = this.sfxGain;
		switch (event.t) {
			case "shoot":
				if (event.special === "frost") this.tone(bus, 880 * jitter, .07, "sine", .03);
				else if (event.special === "ember") this.tone(bus, 180 * jitter, .1, "triangle", .04);
				else if (event.special === "shadow") this.tone(bus, 140 * jitter, .09, "sawtooth", .025);
				else if (event.special === "luminous") this.tone(bus, 720 * jitter, .08, "triangle", .03);
				else if (event.kind === "cannon") this.tone(bus, 130 * jitter, .12, "triangle", .05);
				else this.tone(bus, 640 * jitter, .045, "square", .02);
				break;
			case "kill":
				this.tone(bus, event.kind === "titan" ? 520 : 760, event.kind === "titan" ? .2 : .06, "sine", .04);
				break;
			case "leak":
				this.tone(bus, 98, .22, "sawtooth", .04);
				break;
			case "place":
				this.tone(bus, 230, .08, "triangle", .045);
				break;
			case "upgrade":
				this.tone(bus, 520, .09, "triangle", .04);
				this.tone(bus, 780, .12, "sine", .03);
				break;
			case "sell":
				this.tone(bus, 180, .08, "sine", .035);
				break;
			case "wave":
				this.tone(bus, 392, .12, "triangle", .04);
				this.tone(bus, 523, .16, "sine", .03);
				break;
			case "clear":
				this.tone(bus, 659, .12, "sine", .04);
				break;
			case "win":
				this.tone(bus, 523, .18, "triangle", .04);
				this.tone(bus, 659, .22, "sine", .035);
				this.tone(bus, 784, .28, "sine", .03);
				break;
			case "lose":
				this.tone(bus, 90, .4, "sawtooth", .04);
				break;
			case "nope": this.tone(bus, 110, .06, "square", .03);
		}
	}
	playAll(events) {
		for (const event of events) this.play(event);
	}
	applyGains() {
		if (!this.ctx || !this.musicGain || !this.sfxGain) return;
		const now = this.ctx.currentTime;
		const music = this.muted ? 0 : this.musicVol;
		const sfx = this.muted ? 0 : this.sfxVol;
		this.musicGain.gain.setTargetAtTime(music, now, .03);
		this.sfxGain.gain.setTargetAtTime(sfx, now, .03);
	}
	tone(bus, freq, dur, type, gain, when) {
		if (!this.ctx || !bus) return;
		const t = when ?? this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const amp = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, t);
		amp.gain.setValueAtTime(1e-4, t);
		amp.gain.exponentialRampToValueAtTime(Math.max(2e-4, gain), t + .012);
		amp.gain.exponentialRampToValueAtTime(1e-4, t + dur);
		osc.connect(amp);
		amp.connect(bus);
		osc.start(t);
		osc.stop(t + dur + .02);
		osc.onended = () => {
			osc.disconnect();
			amp.disconnect();
		};
	}
};
function clampVol(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.min(1, Math.max(0, value));
}
var SAVE_KEY = "sky-defenders-v2";
var LEGACY_KEY = "sky-defenders-v1";
var DEFAULT_SAVE = {
	version: 2,
	bestWave: 0,
	victories: 0,
	runs: 0,
	music: .35,
	sfx: .8,
	muted: false,
	shake: true,
	uiScale: "auto",
	hints: true
};
function clamp01(value, fallback) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(1, Math.max(0, n));
}
function clampInt(value, min, max) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return min;
	return Math.min(max, Math.max(min, Math.round(n)));
}
function isScale(value) {
	return value === "auto" || value === "small" || value === "medium" || value === "large";
}
/** Accepts a v1 blob, a v2 blob, or garbage. Always returns a complete v2 save. */
function migrateSave(raw) {
	if (!raw || typeof raw !== "object") return { ...DEFAULT_SAVE };
	const parsed = raw;
	const looksLegacy = parsed.version === 1 || parsed.music === void 0 && parsed.sfx === void 0 && typeof parsed.muted === "boolean";
	return {
		version: 2,
		bestWave: clampInt(parsed.bestWave, 0, 99),
		victories: clampInt(parsed.victories, 0, 9999),
		runs: clampInt(parsed.runs, 0, 9999),
		music: looksLegacy ? DEFAULT_SAVE.music : clamp01(parsed.music, DEFAULT_SAVE.music),
		sfx: looksLegacy ? DEFAULT_SAVE.sfx : clamp01(parsed.sfx, DEFAULT_SAVE.sfx),
		muted: Boolean(parsed.muted),
		shake: parsed.shake !== false,
		uiScale: isScale(parsed.uiScale) ? parsed.uiScale : "auto",
		hints: parsed.hints !== false
	};
}
function loadSave() {
	try {
		const current = localStorage.getItem(SAVE_KEY);
		if (current) return migrateSave(JSON.parse(current));
		const legacy = localStorage.getItem(LEGACY_KEY);
		if (legacy) {
			const migrated = migrateSave(JSON.parse(legacy));
			writeSave(migrated);
			return migrated;
		}
		return { ...DEFAULT_SAVE };
	} catch {
		return { ...DEFAULT_SAVE };
	}
}
function writeSave(data) {
	try {
		const payload = migrateSave(data);
		localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
	} catch {}
}
/** Root font size in px. rem-based chrome scales with it; 44px tap targets stay in CSS px. */
function uiRootPx(mode, width, height) {
	if (mode === "small") return 14;
	if (mode === "medium") return 16;
	if (mode === "large") return 18;
	if (Math.min(width, height) < 360) return 13;
	if (width < 430 || height < 680) return 14.5;
	if (width >= 1400 && height >= 860) return 18;
	if (width >= 1100) return 16.5;
	return 16;
}
function applyUiScale(mode, width = window.innerWidth, height = window.innerHeight) {
	const px = uiRootPx(mode, width, height);
	document.documentElement.style.fontSize = `${px}px`;
	document.documentElement.dataset.uiScale = mode;
	return px;
}
var SCALES = [
	{
		id: "auto",
		label: "Auto",
		detail: "Fits the window"
	},
	{
		id: "small",
		label: "Compact",
		detail: "More map"
	},
	{
		id: "medium",
		label: "Standard",
		detail: "Balanced"
	},
	{
		id: "large",
		label: "Large",
		detail: "Easier to read"
	}
];
function TitleScreen({ save, onStart, onCodex, onSettings }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "menu-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "backdrop",
				src: "/art/menu-backdrop.jpg",
				alt: ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "menu-scrim" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "menu-layout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", {
					className: "menu-portrait",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						className: "guardian-float",
						src: "/art/guardian.jpg",
						alt: "The cosmic guardian above the floating citadel"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "menu-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Floating isles"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Sky Defenders" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "tagline",
							children: "Build · Upgrade · Survive"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lede",
							children: "Hold the crystal gate. Archers and cannons grow through four tiers, then choose Frost, Ember, Shadow, or Luminous."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "menu-btn btn-primary tap",
							onClick: onStart,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Start defending"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "menu-actions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "menu-btn tap",
								onClick: onCodex,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" }), "How to play"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "menu-btn tap",
								onClick: onSettings,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), "Settings"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { save }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "fine",
							children: "Saved on this device. No account."
						})
					]
				})]
			})
		]
	});
}
function CodexScreen({ onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "menu-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "backdrop",
				src: "/art/menu-backdrop.jpg",
				alt: ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "menu-scrim" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "menu-layout",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "menu-card codex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "back-btn tap",
							onClick: onBack,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Back"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "How to play" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Creeps follow the stone road from the west rift to the east gate. Grass accepts towers. The road does not. Each kill pays gold. Each escape costs lives. Twenty lives, twelve waves. Wave twelve sends one Titan." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "codex-list",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodexRow, {
									img: lineArt("archer", 1),
									title: `Archer · ${COSTS.archer} gold`,
									body: "Fast shots and a long reach. Three paid upgrades, then a specialization."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodexRow, {
									img: lineArt("cannon", 1),
									title: `Cannon · ${COSTS.cannon} gold`,
									body: "Slow shells that splash. Same three upgrades, then a specialization."
								}),
								SPEC_ORDER.map((spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodexRow, {
									img: specArt("archer", spec),
									title: SPEC_COPY[spec].name,
									body: SPEC_COPY[spec].blurb
								}, spec))
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Mouse or touch: pick a tower, tap grass, tap a built tower to upgrade or sell. Keys: 1 archer, 2 cannon, Space calls the wave, U upgrades, X sells, T cycles target, F speed, Esc pauses." })
					]
				})
			})
		]
	});
}
function SettingsScreen({ save, reducedMotion, onBack, onChange, onPreview, onResetProgress }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "menu-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "backdrop",
				src: "/art/menu-backdrop.jpg",
				alt: ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "menu-scrim" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "menu-layout",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "menu-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "back-btn tap",
							onClick: onBack,
							autoFocus: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Back"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Settings" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lede",
							children: "These stay in this browser. Nothing is uploaded."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsForm, {
							save,
							reducedMotion,
							onChange,
							onPreview,
							onResetProgress
						})
					]
				})
			})
		]
	});
}
function SettingsSheet({ save, reducedMotion, onClose, onChange, onPreview, onResetProgress }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "veil",
		role: "presentation",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sheet",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "settings-title",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "back-btn tap",
					onClick: onClose,
					autoFocus: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Back to battle"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "settings-title",
					children: "Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Stored on this device only. There is no account to sign into." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsForm, {
					save,
					reducedMotion,
					onChange,
					onPreview,
					onResetProgress
				})
			]
		})
	});
}
function SettingsForm({ save, reducedMotion, onChange, onPreview, onResetProgress }) {
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	const shakeLocked = reducedMotion;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "setting-block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "setting-label",
				children: ["Music", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "setting-value",
					children: Math.round(save.music * 100)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "slider",
				type: "range",
				min: 0,
				max: 100,
				value: Math.round(save.music * 100),
				"aria-label": "Music volume",
				onChange: (event) => onChange({
					music: Number(event.target.value) / 100,
					muted: false
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "setting-block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "setting-label",
				children: ["Effects", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "setting-value",
					children: Math.round(save.sfx * 100)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "slider",
				type: "range",
				min: 0,
				max: 100,
				value: Math.round(save.sfx * 100),
				"aria-label": "Effects volume",
				onChange: (event) => {
					onChange({
						sfx: Number(event.target.value) / 100,
						muted: false
					});
					onPreview();
				}
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: `toggle-row tap ${save.muted ? "is-on" : ""}`,
			"aria-pressed": save.muted,
			onClick: () => onChange({ muted: !save.muted }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mute all" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "toggle-pill",
				children: save.muted ? "On" : "Off"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: `toggle-row tap ${save.shake && !shakeLocked ? "is-on" : ""}`,
			"aria-pressed": save.shake && !shakeLocked,
			disabled: shakeLocked,
			onClick: () => onChange({ shake: !save.shake }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Screen shake" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "toggle-pill",
				children: shakeLocked ? "System off" : save.shake ? "On" : "Off"
			})]
		}),
		shakeLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "fine",
			children: "Your system asked for reduced motion, so the camera stays still."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: `toggle-row tap ${save.hints ? "is-on" : ""}`,
			"aria-pressed": save.hints,
			onClick: () => onChange({ hints: !save.hints }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Control hints" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "toggle-pill",
				children: save.hints ? "On" : "Off"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "setting-block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "setting-label",
				children: "Interface size"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scale-picker",
				role: "group",
				"aria-label": "Interface size",
				children: SCALES.map((scale) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `scale-option tap ${save.uiScale === scale.id ? "is-on" : ""}`,
					"aria-pressed": save.uiScale === scale.id,
					onClick: () => onChange({ uiScale: scale.id }),
					children: [scale.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: scale.detail })]
				}, scale.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "danger-zone",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "fine",
				children: [
					"Best wave ",
					save.bestWave,
					"/12 · Victories ",
					save.victories,
					" · Runs ",
					save.runs
				]
			}), confirmReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "confirm-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-btn btn-danger tap",
					onClick: () => {
						onResetProgress();
						setConfirmReset(false);
					},
					children: "Reset progress"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-btn tap",
					onClick: () => setConfirmReset(false),
					children: "Cancel"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-btn tap",
				onClick: () => setConfirmReset(true),
				children: "Reset best wave and victories"
			})]
		})
	] });
}
function Progress({ save }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: "stat-grid",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Best wave" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [save.bestWave, "/12"] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Victories" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: save.victories })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Runs" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: save.runs })] })
		]
	});
}
function CodexRow({ img, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "codex-item",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: img,
			alt: ""
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "gold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: body })] })]
	});
}
function TopBar({ hud, muted, onMute }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "topbar",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "brand",
			children: "Sky Defenders"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "top-stats",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4" }),
					label: "Gold",
					value: String(hud.gold)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4 heart" }),
					label: "Lives",
					value: String(hud.lives),
					pulseKey: hud.lives
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-4" }),
					label: "Wave",
					value: `${hud.wave}/12`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "tool-btn tap",
					"aria-label": muted ? "Unmute" : "Mute",
					onClick: onMute,
					children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
				})
			]
		})]
	});
}
function Stat({ icon, label, value, pulseKey }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `stat-pill ${pulseKey !== void 0 ? "hud-pop" : ""}`,
		children: [
			icon,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "stat-name",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: value })
		]
	}, pulseKey);
}
function Dock({ hud, hints, blocked, onPlace, onWave, onSpeed, onPause, onSettings, onUpgrade, onSell, onSpec, onTarget }) {
	const selected = hud.selected;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "dock",
		inert: blocked ? true : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dock-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TowerButton, {
						kind: "archer",
						active: hud.placing === "archer",
						disabled: blocked,
						onClick: () => onPlace("archer")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TowerButton, {
						kind: "cannon",
						active: hud.placing === "cannon",
						disabled: blocked,
						onClick: () => onPlace("cannon")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "wave-btn btn-primary tap",
						disabled: blocked || hud.waveActive || hud.wave >= 12,
						onClick: onWave,
						children: hud.waveActive ? `Wave ${hud.wave} on the road` : hud.wave >= 12 ? "Final wave" : `Call wave ${hud.wave + 1}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "dock-tools",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "tool-btn tap",
								disabled: blocked,
								"aria-label": `Speed ${hud.speed} times`,
								onClick: onSpeed,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastForward, { className: "size-4" }),
									hud.speed,
									"×"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "tool-btn tap",
								"aria-label": "Pause",
								onClick: onPause,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "tool-btn tap",
								"aria-label": "Settings",
								onClick: onSettings,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
							})
						]
					})
				]
			}),
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectedCard, {
				selected,
				gold: hud.gold,
				disabled: blocked,
				onUpgrade,
				onSell,
				onSpec,
				onTarget
			}) : hud.placing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "placing-note",
				children: "Tap a grass plot. The road rejects towers. Esc cancels."
			}) : !hud.waveActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "hint-line",
				children: ["Next: ", hud.nextLabel || "the gate is decided"]
			}) : null,
			hints ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "hint-line",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hint-short",
					children: "Tap grass to build. The road is closed."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hint-long",
					children: "Keys: 1 archer, 2 cannon, Space wave, U upgrade, X sell, T target, F speed, Esc pause."
				})]
			}) : null
		]
	});
}
function TowerButton({ kind, active, disabled, onClick }) {
	const copy = TOWER_COPY[kind];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: `tower-btn tap ${active ? "is-on" : ""}`,
		disabled,
		onClick,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: lineArt(kind, 1),
			alt: ""
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "tower-copy",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: copy.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
				className: "price",
				children: [COSTS[kind], " gold"]
			})]
		})]
	});
}
function SelectedCard({ selected, gold, disabled, onUpgrade, onSell, onSpec, onTarget }) {
	const copy = TOWER_COPY[selected.kind];
	const spec = selected.special ? SPEC_COPY[selected.special] : null;
	const cost = selected.upgradeCost ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "select-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "select-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "gold",
					children: spec ? `${spec.name} ${copy.name}` : copy.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "fine",
					children: ["Tier ", selected.level]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "fine",
				children: [
					Math.round(selected.damage),
					" dmg · ",
					selected.rate.toFixed(1),
					"/s · range ",
					selected.range.toFixed(1)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lede",
				children: spec ? spec.blurb : selected.level === 3 ? "Choose a specialization to reach tier four." : copy.blurb
			}),
			selected.level === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "spec-row",
				children: SPEC_ORDER.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "spec-chip tap",
					disabled: disabled || gold < cost,
					onClick: () => onSpec(name),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: specArt(selected.kind, name),
						alt: ""
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [SPEC_COPY[name].name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
						className: "price",
						children: cost
					})] })]
				}, name))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "select-actions",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-btn btn-primary tap",
					disabled: disabled || selected.level >= 4 || gold < cost,
					onClick: onUpgrade,
					children: selected.level >= 4 ? "Mastered" : `Upgrade ${cost}`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "select-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "text-btn tap",
					disabled,
					onClick: onTarget,
					children: ["Target ", selected.targetMode]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "text-btn btn-danger tap",
					disabled,
					onClick: onSell,
					children: ["Sell ", sellValue(selected.spent)]
				})]
			})
		]
	});
}
function EndCard({ phase, wave, best, victories, onResume, onRestart, onMenu, onSettings }) {
	const title = phase === "win" ? "The gate holds" : phase === "lose" ? "The gate has fallen" : "Paused";
	const body = phase === "win" ? `Twelve waves broken, including the Titan. Victories on this device: ${victories}.` : phase === "lose" ? `You fell on wave ${wave}. Best wave cleared: ${best}.` : "Creeps are holding still.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "veil",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "end-card",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "end-title",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "end-title",
					className: phase === "lose" ? "rose" : "gold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "end-actions",
					children: [
						phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "menu-btn btn-primary tap",
							onClick: onResume,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "menu-btn btn-primary tap",
							onClick: onRestart,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), phase === "pause" ? "Restart" : "Play again"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "menu-btn tap",
							onClick: onMenu,
							children: "Main menu"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "menu-btn tap",
							onClick: onSettings,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), "Settings"]
						})
					]
				})
			]
		})
	});
}
function loadImages() {
	const entries = [];
	for (const kind of ["archer", "cannon"]) {
		for (let level = 1; level <= 4; level++) entries.push([`${kind}-${level}`, lineArt(kind, level)]);
		for (const spec of SPEC_ORDER) entries.push([`${kind}-${spec}`, specArt(kind, spec)]);
	}
	return Promise.all(entries.map(([key, src]) => new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve([key, img]);
		img.onerror = () => resolve([key, img]);
		img.src = src;
	}))).then((pairs) => new Map(pairs.filter(([, img]) => img.complete && img.naturalWidth > 0)));
}
function SkyDefenders() {
	const sim = (0, import_react.useRef)(new SkySim());
	const audio = (0, import_react.useRef)(new Soundscape());
	const art = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const canvasRef = (0, import_react.useRef)(null);
	const reduced = (0, import_react.useRef)(false);
	const [reducedMotion, setReducedMotion] = (0, import_react.useState)(false);
	const [save, setSave] = (0, import_react.useState)(DEFAULT_SAVE);
	const [hud, setHud] = (0, import_react.useState)(() => sim.current.hud());
	const [screen, setScreen] = (0, import_react.useState)("title");
	const [sheet, setSheet] = (0, import_react.useState)(false);
	const saveRef = (0, import_react.useRef)(save);
	const screenRef = (0, import_react.useRef)(screen);
	const sheetRef = (0, import_react.useRef)(sheet);
	const beginRef = (0, import_react.useRef)(() => {});
	const closeSheetRef = (0, import_react.useRef)(() => {});
	const fp = (0, import_react.useRef)("");
	const winCounted = (0, import_react.useRef)(false);
	saveRef.current = save;
	screenRef.current = screen;
	sheetRef.current = sheet;
	const sync = () => {
		fp.current = sim.current.fingerprint();
		setHud(sim.current.hud());
	};
	const applyFeel = (next) => {
		audio.current.setMix({
			music: next.music,
			sfx: next.sfx,
			muted: next.muted
		});
		sim.current.juice = next.shake && !reduced.current;
		if (!sim.current.juice) sim.current.trauma = 0;
		sim.current.bestWave = Math.max(sim.current.bestWave, next.bestWave);
	};
	const commitSave = (next) => {
		saveRef.current = next;
		writeSave(next);
		setSave(next);
		applyFeel(next);
	};
	const patchSave = (partial) => {
		commitSave({
			...saveRef.current,
			...partial,
			version: 2
		});
	};
	(0, import_react.useEffect)(() => {
		const stored = loadSave();
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const onMotion = () => {
			reduced.current = mq.matches;
			setReducedMotion(mq.matches);
			sim.current.juice = saveRef.current.shake && !mq.matches;
			if (!sim.current.juice) sim.current.trauma = 0;
		};
		onMotion();
		mq.addEventListener("change", onMotion);
		saveRef.current = stored;
		sim.current.bestWave = stored.bestWave;
		applyFeel(stored);
		setSave(stored);
		sync();
		loadImages().then((map) => {
			art.current = map;
		});
		const onVis = () => {
			if (document.visibilityState === "hidden") writeSave(saveRef.current);
			else audio.current.unlock();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			mq.removeEventListener("change", onMotion);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const apply = () => applyUiScale(save.uiScale);
		apply();
		window.addEventListener("resize", apply);
		return () => window.removeEventListener("resize", apply);
	}, [save.uiScale]);
	(0, import_react.useEffect)(() => {
		const shouldCountWin = hud.phase === "win" && !winCounted.current;
		if (hud.phase === "play" || hud.phase === "menu") winCounted.current = false;
		if (shouldCountWin) winCounted.current = true;
		setSave((prev) => {
			const bestWave = Math.max(prev.bestWave, hud.bestWave);
			const victories = prev.victories + (shouldCountWin ? 1 : 0);
			if (bestWave === prev.bestWave && victories === prev.victories) return prev;
			const next = {
				...prev,
				bestWave,
				victories
			};
			saveRef.current = next;
			writeSave(next);
			return next;
		});
	}, [hud.bestWave, hud.phase]);
	const inMatch = hud.phase !== "menu";
	(0, import_react.useEffect)(() => {
		if (!inMatch) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		let frame = 0;
		let last = performance.now();
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			canvas.width = Math.max(1, Math.floor(rect.width * dpr));
			canvas.height = Math.max(1, Math.floor(rect.height * dpr));
			sim.current.layout = layoutFor(rect.width, rect.height);
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);
		const loop = (now) => {
			frame = requestAnimationFrame(loop);
			const real = Math.min(.05, (now - last) / 1e3);
			last = now;
			const game = sim.current;
			game.decayJuice(real);
			if (game.phase === "play") {
				const events = game.step(real * game.speed);
				audio.current.playAll(events);
			}
			audio.current.tick();
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			drawWorld(ctx, game, art.current, now / 1e3);
			const nextFp = game.fingerprint();
			if (nextFp !== fp.current) {
				fp.current = nextFp;
				setHud(game.hud());
			}
		};
		frame = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [inMatch]);
	function begin() {
		audio.current.unlock();
		const next = {
			...saveRef.current,
			runs: saveRef.current.runs + 1
		};
		commitSave(next);
		const game = sim.current;
		const best = Math.max(game.bestWave, next.bestWave);
		game.resetRun();
		game.bestWave = best;
		applyFeel({
			...next,
			bestWave: best
		});
		setScreen("title");
		setSheet(false);
		winCounted.current = false;
		sync();
	}
	beginRef.current = begin;
	const sheetReturn = (0, import_react.useRef)("stay");
	function openSettings() {
		audio.current.unlock();
		const phase = sim.current.phase;
		if (phase === "menu") {
			setScreen("settings");
			return;
		}
		if (phase === "play") {
			sim.current.phase = "pause";
			sheetReturn.current = "play";
			sync();
		} else if (phase === "pause") sheetReturn.current = "pause";
		else sheetReturn.current = "stay";
		setSheet(true);
	}
	function dismissSettings() {
		setSheet(false);
		if (sheetReturn.current === "play" && sim.current.phase === "pause") {
			sim.current.phase = "play";
			sync();
		}
		sheetReturn.current = "stay";
	}
	closeSheetRef.current = dismissSettings;
	function goMenu() {
		sim.current.phase = "menu";
		setSheet(false);
		setScreen("title");
		sync();
	}
	function resetProgress() {
		sim.current.bestWave = 0;
		commitSave({
			...saveRef.current,
			bestWave: 0,
			victories: 0,
			runs: 0
		});
		sync();
	}
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			const target = event.target instanceof HTMLElement ? event.target : null;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;
			const game = sim.current;
			if (event.code === "Escape") {
				if (sheetRef.current) {
					closeSheetRef.current();
					return;
				}
				if (game.phase === "menu") {
					if (screenRef.current !== "title") setScreen("title");
					return;
				}
				if (game.placing) {
					game.placing = null;
					sync();
					return;
				}
				game.phase = game.phase === "pause" ? "play" : game.phase === "play" ? "pause" : game.phase;
				sync();
				return;
			}
			if (game.phase === "menu") {
				if (screenRef.current !== "title") return;
				if ((event.code === "Enter" || event.code === "Space") && !target?.closest("button")) {
					event.preventDefault();
					beginRef.current();
				}
				return;
			}
			if (event.code === "Space") event.preventDefault();
			if (sheetRef.current || game.phase === "pause" || game.phase === "win" || game.phase === "lose") return;
			if (event.code === "Digit1" || event.code === "Digit2") {
				const kind = event.code === "Digit1" ? "archer" : "cannon";
				game.placing = game.placing === kind ? null : kind;
				game.selectedId = null;
				sync();
			} else if (event.code === "Space" || event.code === "Enter") {
				if (game.startWave()) audio.current.playAll(game.flush());
				sync();
			} else if (event.code === "KeyU") {
				audio.current.playAll(game.upgradeSelected());
				sync();
			} else if (event.code === "KeyX") {
				audio.current.playAll(game.sellSelected());
				sync();
			} else if (event.code === "KeyF") {
				game.speed = game.speed >= 3 ? 1 : game.speed + 1;
				sync();
			} else if (event.code === "KeyT") {
				game.cycleTarget();
				sync();
			} else if (event.code === "KeyP") {
				game.phase = "pause";
				sync();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	function act(run) {
		audio.current.unlock();
		run();
		sync();
	}
	if (!inMatch) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sky-shell",
		children: [
			screen === "codex" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodexScreen, { onBack: () => setScreen("title") }) : null,
			screen === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsScreen, {
				save,
				reducedMotion,
				onBack: () => setScreen("title"),
				onChange: patchSave,
				onPreview: () => audio.current.preview(),
				onResetProgress: resetProgress
			}) : null,
			screen === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, {
				save,
				onStart: begin,
				onCodex: () => {
					audio.current.unlock();
					setScreen("codex");
				},
				onSettings: () => {
					audio.current.unlock();
					setScreen("settings");
				}
			}) : null
		]
	});
	const blocked = hud.phase !== "play" || sheet;
	const showEnd = !sheet && (hud.phase === "pause" || hud.phase === "win" || hud.phase === "lose");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sky-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				hud,
				muted: save.muted,
				onMute: () => patchSave({ muted: !save.muted })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stage",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "play-canvas",
					"aria-label": "Battlefield. Tap grass to build, tap a tower to select it.",
					onContextMenu: (event) => event.preventDefault(),
					onPointerDown: (event) => {
						if (blocked) return;
						const rect = event.currentTarget.getBoundingClientRect();
						act(() => {
							audio.current.playAll(sim.current.clickAt(event.clientX - rect.left, event.clientY - rect.top));
						});
					},
					onPointerMove: (event) => {
						if (blocked) return;
						const rect = event.currentTarget.getBoundingClientRect();
						sim.current.hoverAt(event.clientX - rect.left, event.clientY - rect.top);
					},
					onPointerLeave: () => {
						sim.current.hover = null;
					}
				}), hud.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "toast",
					children: hud.message
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
				hud,
				hints: save.hints,
				blocked,
				onPlace: (kind) => act(() => {
					sim.current.placing = sim.current.placing === kind ? null : kind;
					sim.current.selectedId = null;
				}),
				onWave: () => act(() => {
					if (sim.current.startWave()) audio.current.playAll(sim.current.flush());
				}),
				onSpeed: () => act(() => {
					sim.current.speed = sim.current.speed >= 3 ? 1 : sim.current.speed + 1;
				}),
				onPause: () => act(() => sim.current.phase = "pause"),
				onSettings: openSettings,
				onUpgrade: () => act(() => audio.current.playAll(sim.current.upgradeSelected())),
				onSell: () => act(() => audio.current.playAll(sim.current.sellSelected())),
				onSpec: (spec) => act(() => audio.current.playAll(sim.current.specialize(spec))),
				onTarget: () => act(() => sim.current.cycleTarget())
			}),
			showEnd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EndCard, {
				phase: hud.phase,
				wave: hud.wave,
				best: Math.max(hud.bestWave, save.bestWave),
				victories: save.victories,
				onResume: () => act(() => sim.current.phase = "play"),
				onRestart: begin,
				onMenu: () => act(goMenu),
				onSettings: openSettings
			}) : null,
			sheet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSheet, {
				save,
				reducedMotion,
				onClose: dismissSettings,
				onChange: patchSave,
				onPreview: () => audio.current.preview(),
				onResetProgress: resetProgress
			}) : null
		]
	});
}
var SplitComponent = SkyDefenders;
//#endregion
export { SplitComponent as component };
