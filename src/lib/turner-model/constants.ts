// All dimensions in model units (1 unit ≈ 1 inch)
// Derived from patent drawings US 2,733,032 & US 2,847,175

// --- Upper member (brass skirt + cup + platform) ---
export const SKIRT_OUTER_RADIUS = 9.5;
export const SKIRT_HEIGHT = 5.0;
export const SKIRT_LIP_RADIUS = 9.2; // rolled inward lip at bottom
export const SKIRT_LIP_HEIGHT = 0.35;

export const CUP_TOP_RADIUS = 3.2;
export const CUP_BOTTOM_RADIUS = 1.5;
export const CUP_DEPTH = 4.5;

export const PLATFORM_INNER_RADIUS = 3.0; // ring around cup top
export const PLATFORM_OUTER_RADIUS = 3.6;
export const PLATFORM_HEIGHT = 0.15;

export const RIDGE_COUNT = 5;
export const RIDGE_DEPTH = 0.15; // radial depth of sinusoidal ridges
export const RIDGE_VERTICAL_SPAN = 3.6; // vertical extent of ridged zone

// --- Lower base ---
export const BASE_RADIUS = 8.75;
export const BASE_HEIGHT = 1.0;
export const BASE_FLANGE_HEIGHT = 0.3;
export const GOLD_RIM_RADIUS = 9.0;
export const GOLD_RIM_TUBE_RADIUS = 0.08;

// --- Eyebolts (clamping screws) ---
export const EYEBOLT_COUNT = 3;
export const EYEBOLT_SHAFT_RADIUS = 0.12;
export const EYEBOLT_SHAFT_LENGTH = 3.5;
export const EYEBOLT_EYE_RADIUS = 0.45;
export const EYEBOLT_EYE_TUBE_RADIUS = 0.1;
export const EYEBOLT_NUT_RADIUS = 0.25;
export const EYEBOLT_NUT_HEIGHT = 0.2;
export const EYEBOLT_RING_RADIUS = (PLATFORM_OUTER_RADIUS + 0.15) * 1.5;

// --- Electrical outlet ---
export const OUTLET_WIDTH = 0.6;
export const OUTLET_HEIGHT = 0.9;
export const OUTLET_DEPTH = 0.3;

// --- Remote control box ---
export const REMOTE_WIDTH = 3.2;
export const REMOTE_HEIGHT = 2.0;
export const REMOTE_DEPTH = 1.2;
export const SWITCH_WIDTH = 0.5;
export const SWITCH_HEIGHT = 0.8;
export const SWITCH_DEPTH = 0.15;
export const SWITCH_SPACING = 0.95;

// --- Power cord & wall plug ---
export const CORD_RADIUS = 0.12;
export const PLUG_WIDTH = 1.0;
export const PLUG_HEIGHT = 1.4;
export const PLUG_DEPTH = 0.5;
export const PRONG_RADIUS = 0.04;
export const PRONG_LENGTH = 0.6;
export const PRONG_SPACING = 0.35;

// --- Lathe geometry detail ---
export const LATHE_SEGMENTS = 128;
export const PROFILE_POINTS = 80;

// --- Colors ---
export const COLOR_BRASS = 0xB8956A;
export const COLOR_ZINC = 0x8A8A8A;
export const COLOR_BLACK_PLASTIC = 0x222222;
export const COLOR_BLACK_METAL = 0x1A1A1A;
export const COLOR_RUBBER = 0x111111;
export const COLOR_GOLD_RIM = 0xC4A44A;
export const COLOR_BACKGROUND = 0xf8f7f2;

// --- Exploded view offsets (Y axis) ---
export const EXPLODE_OFFSETS = {
  eyebolts: 6,
  outlet: 4,
  upperMember: 2,
  lowerBase: 0,
  remote: -3,
} as const;

// --- Part descriptions for info panel ---
export const PART_INFO: Record<string, { name: string; description: string }> = {
  upperMember: {
    name: 'Upper Member',
    description: 'Spun brass frusto-conical skirt with 5 decorative ridges and rolled lip. Houses the rotating cup socket for the tree trunk.',
  },
  cupSocket: {
    name: 'Cup Socket',
    description: 'Tapered brass well that receives the tree trunk. Connected to the motor spindle below for rotation.',
  },
  platform: {
    name: 'Annular Platform',
    description: 'Flat brass ring connecting the cup to the skirt top. Threaded holes accept the 3 eyebolt clamping screws.',
  },
  eyebolts: {
    name: 'Clamping Screws',
    description: '3 zinc-plated steel eyebolts at 120° intervals. Thread through the platform ring to secure the tree trunk in the cup.',
  },
  outlet: {
    name: 'Electrical Outlet',
    description: '2-prong receptacle embedded in the skirt wall. Provides power to Christmas tree lights via slip-ring contact.',
  },
  lowerBase: {
    name: 'Lower Base',
    description: 'Stationary glossy black painted metal pan. Houses the motor, music box, and electrical components. Hidden by the skirt when assembled.',
  },
  goldRim: {
    name: 'Gold Rim',
    description: 'Thin decorative brass ring at the base edge. Visible as a gold accent line between skirt and floor.',
  },
  remote: {
    name: 'Remote Control',
    description: 'Black plastic control box with 3 toggle switches: LIGHTS, ROTATE, and MUSIC. Connected via cord to the base.',
  },
  cord: {
    name: 'Power Cord',
    description: 'Rubber-insulated cord running from the remote control to the base, with a 2-prong wall plug at the end.',
  },
};
