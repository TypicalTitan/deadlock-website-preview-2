// The event's phase and key dates. They live in Supabase's `settings` table; until it exists, the defaults apply:
// still setting up, no dates yet.
import { useEffect, useState } from 'preact/hooks';
import { getClient } from './supabase.js';

const defaults = {
  phase: 'setup',
  signups_open_at: null,
  signup_deadline: null,
  roster_lock_at: null,
  scrims_start_at: null,
  bracket_start_at: null,
};

// Each phase's banner label, and the setting its countdown runs to.
const phases = {
  setup: { label: 'Signups open soon', field: 'signups_open_at', until: 'Signups open in' },
  signups: { label: 'Signups open', field: 'signup_deadline', until: 'Signups close in' },
  locked: { label: 'Rosters locked', field: 'scrims_start_at', until: 'Scrim week starts in' },
  scrims: { label: 'Scrim week', field: 'bracket_start_at', until: 'Round 1 starts in' },
  bracket: { label: 'Bracket under way', field: null },
  finished: { label: 'Finished', field: null },
};

export function useEventSettings() {
  const [settings, setSettings] = useState(defaults);
  useEffect(() => {
    getClient().then(async supabase => {
      if (!supabase) return;
      const { data } = await supabase.from('settings').select('*').limit(1).maybeSingle();
      if (data) setSettings({ ...defaults, ...data }); // no table or no row yet: keep the defaults
    });
  }, []);
  return settings;
}

// { key, label, until, at, hasDeadline }: `at` is the next deadline as a Date, or null until it's set.
export function currentPhase(settings) {
  const key = phases[settings.phase] ? settings.phase : 'setup';
  const { label, field, until } = phases[key];
  return { key, label, until, at: field && settings[field] ? new Date(settings[field]) : null, hasDeadline: Boolean(field) };
}
