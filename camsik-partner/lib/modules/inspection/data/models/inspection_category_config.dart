import 'package:flutter/material.dart';
import '../../../../models/partner_models.dart';

class InspectionCheckItem {
  final String id;
  final String label;
  final String subtext;
  final int deductionPct;

  const InspectionCheckItem({
    required this.id,
    required this.label,
    required this.subtext,
    required this.deductionPct,
  });
}

class PhotoAngle {
  final String id;
  final String label;
  final String desc;

  const PhotoAngle({
    required this.id,
    required this.label,
    required this.desc,
  });
}

enum DeviceCategory {
  dslrCamera,
  lens,
  laptop,
  tablet,
  actionCamera,
  smartphone,
}

class CategoryInspectionConfig {
  final DeviceCategory category;
  final String categoryName;
  final String categoryBadge;
  final IconData icon;
  final Color badgeColor;
  final String identifierLabel;
  final String identifierHint;
  final bool isImei;
  final List<InspectionCheckItem> items;
  final List<PhotoAngle> photoAngles;

  const CategoryInspectionConfig({
    required this.category,
    required this.categoryName,
    required this.categoryBadge,
    required this.icon,
    required this.badgeColor,
    required this.identifierLabel,
    required this.identifierHint,
    required this.isImei,
    required this.items,
    required this.photoAngles,
  });
}

// ─── DSLR & MIRRORLESS CAMERA ──────────────────────────────────────────────
const _cameraItems = [
  InspectionCheckItem(
    id: 'sensor',
    label: 'OEM Sensor & Hot/Dead Pixels',
    subtext: 'CMOS sensor clean, no fungus, zero dead pixels or laser burn',
    deductionPct: 25,
  ),
  InspectionCheckItem(
    id: 'shutter',
    label: 'Mechanical Shutter & Curtain',
    subtext: 'Mechanical shutter count under 50k cycles, snappy curtain action',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'autofocus',
    label: 'Autofocus & Mount Contacts',
    subtext: 'Fast phase-detection lock, gold electronic bayonet pins unscratched',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'evf_screen',
    label: 'Viewfinder (EVF) & Articulated LCD',
    subtext: 'Viewfinder diopter clear, touch swivel screen responsive, no burn-in',
    deductionPct: 12,
  ),
  InspectionCheckItem(
    id: 'body_grip',
    label: 'Body Frame, Rubber Grip & Dials',
    subtext: 'Dials turn smoothly, rubber grip unpeeled, hot shoe intact',
    deductionPct: 10,
  ),
  InspectionCheckItem(
    id: 'card_slots',
    label: 'Dual/Single Memory Card Slots',
    subtext: 'CFexpress & SD slots read/write test passed without buffer error',
    deductionPct: 8,
  ),
  InspectionCheckItem(
    id: 'battery',
    label: 'OEM Battery & Chamber Latch',
    subtext: 'OEM battery retention, zero terminal corrosion or door latch crack',
    deductionPct: 10,
  ),
  InspectionCheckItem(
    id: 'ports',
    label: 'HDMI, USB-C & Audio Ports',
    subtext: 'Clean video feed out, USB tethering and 3.5mm mic jack work',
    deductionPct: 5,
  ),
];

const _cameraPhotoAngles = [
  PhotoAngle(id: 'sensor_mount', label: 'Sensor & Mount Cavity', desc: 'Front mount with cap off'),
  PhotoAngle(id: 'top_dials', label: 'Top Plate & Mode Dials', desc: 'Top view with dials & hot shoe'),
  PhotoAngle(id: 'rear_lcd', label: 'Back LCD & EVF (Screen On)', desc: 'Rear view with display powered on'),
  PhotoAngle(id: 'front_body', label: 'Front Body & Hand Grip', desc: 'Front view showing rubber grip'),
  PhotoAngle(id: 'bottom_serial', label: 'Base Plate & Serial Label', desc: 'Bottom tripod thread & S/N'),
  PhotoAngle(id: 'card_battery', label: 'Battery & Card Slots', desc: 'Open battery & memory doors'),
  PhotoAngle(id: 'side_terminals', label: 'Left/Right Port Covers', desc: 'USB, HDMI & Mic covers'),
  PhotoAngle(id: 'defect_closeup', label: 'Cosmetic Scratches / Dents', desc: 'Any blemish or wear mark'),
];

// ─── CAMERA LENS ────────────────────────────────────────────────────────────
const _lensItems = [
  InspectionCheckItem(
    id: 'optics',
    label: 'Front & Rear Glass Elements',
    subtext: 'Zero fungus, haze, internal dust, scratches or coating peeling',
    deductionPct: 30,
  ),
  InspectionCheckItem(
    id: 'af_motor',
    label: 'Autofocus Motor (USM/STM/Linear)',
    subtext: 'Silent, smooth and accurate AF hunting and instant lock',
    deductionPct: 20,
  ),
  InspectionCheckItem(
    id: 'rings',
    label: 'Zoom & Manual Focus Rings',
    subtext: 'Even rotation damping, zero gritty resistance, no loose zoom creep',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'aperture',
    label: 'Aperture Blades & Diaphragm',
    subtext: 'Blades clean, zero oil residue, snappy click at all f-stops',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'mount',
    label: 'Metal Bayonet Mount & Pins',
    subtext: 'Brass/metal flange secure, gold contacts clean, rubber gasket intact',
    deductionPct: 10,
  ),
  InspectionCheckItem(
    id: 'stabilizer',
    label: 'Optical Stabilization (IS/OIS/VR)',
    subtext: 'Internal gyro element stabilization works with zero vibration hum',
    deductionPct: 10,
  ),
];

const _lensPhotoAngles = [
  PhotoAngle(id: 'front_element', label: 'Front Glass Element', desc: 'Front glass reflected under light'),
  PhotoAngle(id: 'rear_element', label: 'Rear Glass & Bayonet', desc: 'Rear glass & metal mount pins'),
  PhotoAngle(id: 'aperture_blades', label: 'Aperture Blades', desc: 'Looking through lens diaphragm'),
  PhotoAngle(id: 'barrel_markings', label: 'Lens Barrel Markings', desc: 'Focal length & distance window'),
  PhotoAngle(id: 'rubber_rings', label: 'Zoom & Focus Rings', desc: 'Rubber grip rings condition'),
  PhotoAngle(id: 'serial_mount', label: 'Serial Number & Mount', desc: 'Base engraving of serial code'),
  PhotoAngle(id: 'switches', label: 'AF/MF & Stabilizer Switch', desc: 'Side switch panel'),
  PhotoAngle(id: 'defect', label: 'Scratch / Dust Close-up', desc: 'Close-up of any optical flaw'),
];

// ─── LAPTOP & MACBOOK ───────────────────────────────────────────────────────
const _laptopItems = [
  InspectionCheckItem(
    id: 'display',
    label: 'Display Panel & Tight Hinges',
    subtext: 'Zero lines, dead pixels, backlight bleed or keyboard imprint marks',
    deductionPct: 25,
  ),
  InspectionCheckItem(
    id: 'keyboard',
    label: 'Keyboard, Backlight & Trackpad',
    subtext: 'All keys register, backlight uniform, haptic trackpad responsive',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'battery',
    label: 'Battery Health & Cycle Retention',
    subtext: '>80% battery capacity retention, zero chassis bulging from swelling',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'motherboard',
    label: 'Motherboard & Thermal Fans',
    subtext: 'Dual fans whisper quiet, CPU/GPU stress test passed without shutoff',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'ports',
    label: 'USB-C, Thunderbolt & Charging',
    subtext: 'Power delivery charging, external monitor output & USB transfer ok',
    deductionPct: 10,
  ),
  InspectionCheckItem(
    id: 'speakers',
    label: 'Stereo Speakers, Mic & Webcam',
    subtext: 'Clear stereo sound, zero buzz at max volume, HD webcam functional',
    deductionPct: 8,
  ),
  InspectionCheckItem(
    id: 'body',
    label: 'Aluminum Chassis & Palmrest',
    subtext: 'No corner dents, rubber feet intact, top lid unbent',
    deductionPct: 7,
  ),
  InspectionCheckItem(
    id: 'charger',
    label: 'Original Box & OEM High-Watt Adapter',
    subtext: 'Authentic high-wattage power adapter and cable included',
    deductionPct: 5,
  ),
];

const _laptopPhotoAngles = [
  PhotoAngle(id: 'screen_on', label: 'Screen On (White Wallpaper)', desc: 'Display on showing zero defects'),
  PhotoAngle(id: 'keyboard_deck', label: 'Keyboard & Trackpad Deck', desc: 'Keyboard with backlight lit'),
  PhotoAngle(id: 'top_lid', label: 'Top Aluminum Lid & Logo', desc: 'Closed top lid surface'),
  PhotoAngle(id: 'bottom_base', label: 'Bottom Case & Serial Number', desc: 'Base cover, vents & serial text'),
  PhotoAngle(id: 'left_ports', label: 'Left Side Ports / MagSafe', desc: 'Left edge connectors'),
  PhotoAngle(id: 'right_ports', label: 'Right Side Ports & Audio', desc: 'Right edge connectors'),
  PhotoAngle(id: 'specs_screen', label: 'System Specs / Battery Health', desc: 'About / Battery Cycle screen'),
  PhotoAngle(id: 'defect', label: 'Corner Dents / Scratches', desc: 'Close-up of cosmetic flaws'),
];

// ─── TABLET & IPAD ──────────────────────────────────────────────────────────
const _tabletItems = [
  InspectionCheckItem(
    id: 'touch',
    label: 'Retina/OLED Touch & Pencil Support',
    subtext: 'Zero dead spots, instant touch response & Apple Pencil palm rejection',
    deductionPct: 25,
  ),
  InspectionCheckItem(
    id: 'frame',
    label: 'Chassis Straightness & Frame',
    subtext: 'Zero chassis bending when laid flat, edge chamfers unchipped',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'battery',
    label: 'Battery Health & Endurance',
    subtext: 'Battery retention >85%, stable discharge without rapid drop',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'biometrics',
    label: 'Biometrics (Face ID / Touch ID)',
    subtext: 'TrueDepth sensor or power button fingerprint scanner functional',
    deductionPct: 12,
  ),
  InspectionCheckItem(
    id: 'speakers',
    label: 'Quad Speakers & Microphones',
    subtext: 'Balanced sound across all 4 corner grilles, clean audio recording',
    deductionPct: 10,
  ),
  InspectionCheckItem(
    id: 'ports',
    label: 'USB-C & Smart Keyboard Pins',
    subtext: 'Fast charging, data sync and Magic Keyboard magnetic pins intact',
    deductionPct: 8,
  ),
  InspectionCheckItem(
    id: 'cameras',
    label: 'Front (Center Stage) & Rear Cameras',
    subtext: 'Ultra-wide front camera, rear 4K video recording and LiDAR sensor',
    deductionPct: 8,
  ),
  InspectionCheckItem(
    id: 'accessories',
    label: 'Original Box & Charging Cable',
    subtext: 'Original packaging matching serial code and authentic USB-C cable',
    deductionPct: 7,
  ),
];

const _tabletPhotoAngles = [
  PhotoAngle(id: 'front_screen', label: 'Front Screen On', desc: 'Display powered on with clean wallpaper'),
  PhotoAngle(id: 'back_panel', label: 'Back Housing & Camera Bump', desc: 'Back aluminum panel'),
  PhotoAngle(id: 'straight_frame', label: 'Side Profile (No Bend Test)', desc: 'Edge showing straight chassis'),
  PhotoAngle(id: 'smart_connector', label: 'Magnetic Edge & Smart Pins', desc: 'Stylus magnetic charging zone'),
  PhotoAngle(id: 'top_edge', label: 'Top Edge & Power Button', desc: 'Top edge with speaker grilles'),
  PhotoAngle(id: 'bottom_edge', label: 'Bottom Edge & USB-C Port', desc: 'Bottom charging port area'),
  PhotoAngle(id: 'about_screen', label: 'Settings > About Screen', desc: 'Serial & model number screen'),
  PhotoAngle(id: 'defect', label: 'Screen Scratches or Scuffs', desc: 'Close-up of any blemish'),
];

// ─── ACTION CAMERA, DRONE & GIMBAL ──────────────────────────────────────────
const _actionCamItems = [
  InspectionCheckItem(
    id: 'optics',
    label: 'Front Lens Protector & Sensor',
    subtext: 'Hydrophobic lens element unscratched, internal sensor dust-free',
    deductionPct: 25,
  ),
  InspectionCheckItem(
    id: 'stabilization',
    label: 'Stabilization & Horizon Lock',
    subtext: 'HyperSmooth/RockSteady/3-axis gimbal smooth with zero motor jitter',
    deductionPct: 20,
  ),
  InspectionCheckItem(
    id: 'displays',
    label: 'Dual Touchscreen & Front Display',
    subtext: 'Responsive rear touch LCD, front framing color screen clear',
    deductionPct: 12,
  ),
  InspectionCheckItem(
    id: 'waterproof',
    label: 'Waterproof Door Seals & Latches',
    subtext: 'Rubber weather gaskets intact, battery door latches lock firmly',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'thermals',
    label: 'Battery Performance & 4K Thermals',
    subtext: 'Sustained 4K/60fps video recording without premature thermal cut-off',
    deductionPct: 10,
  ),
  InspectionCheckItem(
    id: 'audio',
    label: 'Wind-Noise Suppression Microphones',
    subtext: 'Stereo audio recording clean, zero water distortion in mic mesh',
    deductionPct: 8,
  ),
  InspectionCheckItem(
    id: 'controls',
    label: 'Physical Buttons & Voice Control',
    subtext: 'Shutter button, side mode button and voice recognition responsive',
    deductionPct: 5,
  ),
  InspectionCheckItem(
    id: 'mount',
    label: 'Folding Mounting Fingers & Thread',
    subtext: 'Base folding mounting prongs rigid, screw thread undamaged',
    deductionPct: 5,
  ),
];

const _actionCamPhotoAngles = [
  PhotoAngle(id: 'front_lens', label: 'Front Lens & Front Screen', desc: 'Front view with display on'),
  PhotoAngle(id: 'touch_screen', label: 'Rear Touchscreen (Screen On)', desc: 'Rear LCD powered on'),
  PhotoAngle(id: 'door_seals', label: 'Battery Door & Rubber Seal', desc: 'Open door showing weather gasket'),
  PhotoAngle(id: 'mounting_prongs', label: 'Folding Mounting Fingers', desc: 'Base magnetic / folding mount'),
  PhotoAngle(id: 'top_shutter', label: 'Top Shutter Button & Mic', desc: 'Top view with mic grille'),
  PhotoAngle(id: 'side_mode', label: 'Side Mode Button & Housing', desc: 'Side controls view'),
  PhotoAngle(id: 'battery_slot', label: 'Battery Chamber & SD Slot', desc: 'Internal card & battery bay'),
  PhotoAngle(id: 'defect', label: 'Scuffs / Lens Rim Scratches', desc: 'Close-up of cosmetic marks'),
];

// ─── SMARTPHONE (DEFAULT) ───────────────────────────────────────────────────
const _smartphoneItems = [
  InspectionCheckItem(
    id: 'display',
    label: 'Display & Touchscreen',
    subtext: 'OEM panel, zero cracks, dead pixels, lines or touch lag',
    deductionPct: 25,
  ),
  InspectionCheckItem(
    id: 'body',
    label: 'Body & Frame Condition',
    subtext: 'Dents, heavy scratches, bent frame, back glass or discoloration',
    deductionPct: 12,
  ),
  InspectionCheckItem(
    id: 'camera',
    label: 'Camera & Optics',
    subtext: 'Main, ultra-wide & telephoto focus, clean lens glass & 4K video',
    deductionPct: 15,
  ),
  InspectionCheckItem(
    id: 'battery',
    label: 'Battery Health & Endurance',
    subtext: '>85% health retention, peak performance capability, no rapid drain',
    deductionPct: 10,
  ),
  InspectionCheckItem(
    id: 'faceid',
    label: 'Biometrics (Face ID / Fingerprint)',
    subtext: 'Instant biometric recognition, in-display sensor or 3D Face ID',
    deductionPct: 12,
  ),
  InspectionCheckItem(
    id: 'charging',
    label: 'Charging & USB Port',
    subtext: 'Fast charging, wireless Qi charging, PC data connectivity',
    deductionPct: 8,
  ),
  InspectionCheckItem(
    id: 'speaker',
    label: 'Speakers & Microphones',
    subtext: 'Stereo earpiece, loud bottom speaker, dual noise-cancelling mics',
    deductionPct: 6,
  ),
  InspectionCheckItem(
    id: 'wifi',
    label: 'Wireless (Wi-Fi, Bluetooth, NFC)',
    subtext: 'Wi-Fi 6, Bluetooth audio pairing and NFC tap-to-pay functional',
    deductionPct: 6,
  ),
  InspectionCheckItem(
    id: 'network',
    label: 'Cellular SIM & Antennas',
    subtext: 'Dual SIM / eSIM detection, 5G/VoLTE carrier connectivity',
    deductionPct: 10,
  ),
  InspectionCheckItem(
    id: 'buttons',
    label: 'Physical Buttons & Haptics',
    subtext: 'Volume rocker, power/action button, alert slider and haptic motor',
    deductionPct: 5,
  ),
  InspectionCheckItem(
    id: 'water',
    label: 'Liquid Damage Check (LDI)',
    subtext: 'Moisture indicator inside SIM slot pure white (not triggered red)',
    deductionPct: 20,
  ),
  InspectionCheckItem(
    id: 'accessories',
    label: 'Original Box & Accessories',
    subtext: 'Original box matching IMEI, authentic cable and SIM pin',
    deductionPct: 5,
  ),
];

const _smartphonePhotoAngles = [
  PhotoAngle(id: 'front', label: 'Front Display (Screen On)', desc: 'Display with white background'),
  PhotoAngle(id: 'back', label: 'Back Panel & Housing', desc: 'Back glass or aluminum body'),
  PhotoAngle(id: 'left', label: 'Left Side & Frame', desc: 'Left edge & volume buttons'),
  PhotoAngle(id: 'right', label: 'Right Side & Frame', desc: 'Right edge & power button'),
  PhotoAngle(id: 'ports', label: 'Top / Bottom Ports', desc: 'Charging port & speaker grilles'),
  PhotoAngle(id: 'camera_lens', label: 'Camera Lens & Optics', desc: 'Close-up of camera cluster'),
  PhotoAngle(id: 'imei_label', label: 'IMEI / Serial Screen', desc: 'Settings > About screen'),
  PhotoAngle(id: 'defect', label: 'Scratch / Defect Close-up', desc: 'Any cosmetic blemish'),
];

/// Intelligently detect the device category from order metadata
DeviceCategory detectDeviceCategory(PartnerOrder order) {
  final name = '${order.deviceName} ${order.deviceBrand} ${order.deviceModel}'.toLowerCase();

  // 1. Lens check first (before DSLR, because lenses can have brand Canon/Sony/Nikon)
  if (name.contains('lens') ||
      name.contains('24-70') ||
      name.contains('70-200') ||
      name.contains('18-55') ||
      name.contains('16-35') ||
      name.contains('50mm') ||
      name.contains('35mm') ||
      name.contains('85mm') ||
      name.contains('24mm') ||
      name.contains('f/1.') ||
      name.contains('f/2.') ||
      name.contains('f/4') ||
      name.contains('sigma') ||
      name.contains('tamron') ||
      name.contains('samyang') ||
      name.contains('rokinon') ||
      name.contains('telephoto') ||
      name.contains('macro prime') ||
      name.contains('art dg dn') ||
      name.contains('zoom lens')) {
    return DeviceCategory.lens;
  }

  // 2. Action Cameras & Drones & Gimbals
  if (name.contains('gopro') ||
      name.contains('hero') ||
      name.contains('insta360') ||
      name.contains('action') ||
      name.contains('osmo') ||
      name.contains('pocket') ||
      name.contains('dji') ||
      name.contains('ronin') ||
      name.contains('gimbal') ||
      name.contains('mavic') ||
      name.contains('feiyutech') ||
      name.contains('zhiyun')) {
    return DeviceCategory.actionCamera;
  }

  // 3. DSLR & Mirrorless Cameras
  if (name.contains('camera') ||
      name.contains('dslr') ||
      name.contains('mirrorless') ||
      name.contains('alpha a') ||
      name.contains('a7') ||
      name.contains('a6') ||
      name.contains('eos') ||
      name.contains('nikon z') ||
      name.contains('d850') ||
      name.contains('d750') ||
      name.contains('lumix') ||
      name.contains('fujifilm x') ||
      name.contains('fx3') ||
      name.contains('fx30') ||
      name.contains('r5') ||
      name.contains('r6') ||
      name.contains('r7') ||
      name.contains('r8') ||
      name.contains('r10') ||
      name.contains('r50')) {
    return DeviceCategory.dslrCamera;
  }

  // 4. Laptops & MacBooks
  if (name.contains('laptop') ||
      name.contains('macbook') ||
      name.contains('thinkpad') ||
      name.contains('zenbook') ||
      name.contains('ideapad') ||
      name.contains('xps') ||
      name.contains('pavilion') ||
      name.contains('envy') ||
      name.contains('spectre') ||
      name.contains('surface laptop') ||
      name.contains('legion') ||
      name.contains('alienware') ||
      name.contains('chromebook')) {
    return DeviceCategory.laptop;
  }

  // 5. Tablets & iPads
  if (name.contains('ipad') ||
      name.contains('tablet') ||
      name.contains('galaxy tab') ||
      name.contains('oneplus pad') ||
      name.contains('surface pro') ||
      name.contains('tab s')) {
    return DeviceCategory.tablet;
  }

  // 6. Default to Smartphone
  return DeviceCategory.smartphone;
}

CategoryInspectionConfig getInspectionConfigForOrder(PartnerOrder order) {
  final cat = detectDeviceCategory(order);
  switch (cat) {
    case DeviceCategory.dslrCamera:
      return const CategoryInspectionConfig(
        category: DeviceCategory.dslrCamera,
        categoryName: 'DSLR & Mirrorless Camera',
        categoryBadge: 'Camera QA Profile',
        icon: Icons.camera_alt_rounded,
        badgeColor: Color(0xFF0284C7),
        identifierLabel: 'CAMERA SERIAL NUMBER (S/N)',
        identifierHint: 'Enter camera body serial number (e.g. 2104598)',
        isImei: false,
        items: _cameraItems,
        photoAngles: _cameraPhotoAngles,
      );

    case DeviceCategory.lens:
      return const CategoryInspectionConfig(
        category: DeviceCategory.lens,
        categoryName: 'Camera Lens & Optics',
        categoryBadge: 'Lens QA Profile',
        icon: Icons.camera_rounded,
        badgeColor: Color(0xFF7C3AED),
        identifierLabel: 'LENS SERIAL NUMBER (S/N)',
        identifierHint: 'Enter lens serial on barrel/mount (e.g. 549281)',
        isImei: false,
        items: _lensItems,
        photoAngles: _lensPhotoAngles,
      );

    case DeviceCategory.laptop:
      return const CategoryInspectionConfig(
        category: DeviceCategory.laptop,
        categoryName: 'Laptop & Computer',
        categoryBadge: 'Laptop QA Profile',
        icon: Icons.laptop_mac_rounded,
        badgeColor: Color(0xFFD97706),
        identifierLabel: 'LAPTOP SERIAL NUMBER (S/N)',
        identifierHint: 'Enter serial number from bottom cover (e.g. C02X...)',
        isImei: false,
        items: _laptopItems,
        photoAngles: _laptopPhotoAngles,
      );

    case DeviceCategory.tablet:
      return const CategoryInspectionConfig(
        category: DeviceCategory.tablet,
        categoryName: 'Tablet & iPad',
        categoryBadge: 'Tablet QA Profile',
        icon: Icons.tablet_mac_rounded,
        badgeColor: Color(0xFF059669),
        identifierLabel: 'SERIAL / IMEI NUMBER',
        identifierHint: 'Enter serial from Settings > General > About',
        isImei: false,
        items: _tabletItems,
        photoAngles: _tabletPhotoAngles,
      );

    case DeviceCategory.actionCamera:
      return const CategoryInspectionConfig(
        category: DeviceCategory.actionCamera,
        categoryName: 'Action Camera & Drone',
        categoryBadge: 'Action QA Profile',
        icon: Icons.videocam_rounded,
        badgeColor: Color(0xFFDC2626),
        identifierLabel: 'DEVICE SERIAL NUMBER (S/N)',
        identifierHint: 'Enter serial number from battery compartment',
        isImei: false,
        items: _actionCamItems,
        photoAngles: _actionCamPhotoAngles,
      );

    case DeviceCategory.smartphone:
      return const CategoryInspectionConfig(
        category: DeviceCategory.smartphone,
        categoryName: 'Smartphone',
        categoryBadge: 'Mobile QA Profile',
        icon: Icons.phone_iphone_rounded,
        badgeColor: Color(0xFF2563EB),
        identifierLabel: '15-DIGIT IMEI NUMBER',
        identifierHint: 'Dial *#06# or inspect SIM tray',
        isImei: true,
        items: _smartphoneItems,
        photoAngles: _smartphonePhotoAngles,
      );
  }
}