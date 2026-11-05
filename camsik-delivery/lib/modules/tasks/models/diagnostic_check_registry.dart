import '../../../../models/delivery_models.dart';

class DiagnosticCheckItem {
  final String id;
  final String label;
  final String subtext;
  final int deductionPct;

  const DiagnosticCheckItem({
    required this.id,
    required this.label,
    required this.subtext,
    required this.deductionPct,
  });
}

class DiagnosticCheckRegistry {
  DiagnosticCheckRegistry._();

  static List<DiagnosticCheckItem> getChecksForCategory(DeviceCategory category) {
    switch (category) {
      case DeviceCategory.camera:
        return const [
          DiagnosticCheckItem(id: 'cam-power', label: 'Does the camera power on & shoot normally?', subtext: 'Check sensor readout, shutter mechanism, dials and screen.', deductionPct: 25),
          DiagnosticCheckItem(id: 'cam-sensor', label: 'Sensor Glass & Viewfinder Condition?', subtext: 'Check sensor surface under direct light for spots or scratches.', deductionPct: 20),
          DiagnosticCheckItem(id: 'cam-body', label: 'Body Cosmetic & Rubber Grip Condition?', subtext: 'Inspect body corners, tripod mount, and rubber grip peeling.', deductionPct: 12),
          DiagnosticCheckItem(id: 'cam-shutter', label: 'Estimated Shutter Actuations?', subtext: 'Total photos clicked with this camera body.', deductionPct: 15),
          DiagnosticCheckItem(id: 'cam-display', label: 'LCD Screen & Articulation / Touch?', subtext: 'Check screen tilt mechanism, touch response, and scratch marks.', deductionPct: 15),
          DiagnosticCheckItem(id: 'cam-hardware', label: 'Buttons, Dials & Mount Interface?', subtext: 'Test all command dials, joystick, hotshoe, and SD card door.', deductionPct: 10),
          DiagnosticCheckItem(id: 'cam-water', label: 'Moisture, Sand or Fungus Exposure?', subtext: 'Check inside battery compartment and lens mount for corrosion.', deductionPct: 25),
          DiagnosticCheckItem(id: 'cam-accessories', label: 'Original Charger, Battery & Packaging Box?', subtext: 'Original OEM battery, dedicated charger, body cap, and box.', deductionPct: 8),
        ];

      case DeviceCategory.lens:
        return const [
          DiagnosticCheckItem(id: 'lens-optics', label: 'Front & Rear Glass Element Condition?', subtext: 'Inspect multicoating for scratches, chips, or wipe marks.', deductionPct: 25),
          DiagnosticCheckItem(id: 'lens-fungus', label: 'Internal Optics & Fungus / Haze?', subtext: 'Shine light through barrel to check for fungus, fog, or dust.', deductionPct: 30),
          DiagnosticCheckItem(id: 'lens-autofocus', label: 'Autofocus Motor & Manual Focus Ring?', subtext: 'Verify AF acquisition speed, tracking accuracy, and USM motor.', deductionPct: 18),
          DiagnosticCheckItem(id: 'lens-aperture', label: 'Aperture Iris Blades Mechanism?', subtext: 'Check for oil on aperture blades and sticky stopping down.', deductionPct: 18),
          DiagnosticCheckItem(id: 'lens-zoom', label: 'Zoom Mechanism & Barrel Smoothness?', subtext: 'Rotate zoom ring; check for zoom creep or gritty movement.', deductionPct: 12),
          DiagnosticCheckItem(id: 'lens-mount', label: 'Metal Bayonet Mount & Electronic Pins?', subtext: 'Inspect mount tightness, locking pin, and gold contact pins.', deductionPct: 12),
          DiagnosticCheckItem(id: 'lens-body', label: 'Outer Barrel Cosmetic Condition?', subtext: 'Body scratches, paint rub-off, rubber grip ring condition.', deductionPct: 10),
          DiagnosticCheckItem(id: 'lens-caps', label: 'Original Front & Rear Caps + Lens Hood?', subtext: 'Includes genuine OEM front lens cap, rear cap, and hood.', deductionPct: 6),
        ];

      case DeviceCategory.laptop:
        return const [
          DiagnosticCheckItem(id: 'lap-power', label: 'Does the laptop boot into OS and sleep/wake normally?', subtext: 'Powers on without chime failure or unexpected shutdowns.', deductionPct: 25),
          DiagnosticCheckItem(id: 'lap-display', label: 'Screen & Anti-Reflective Coating Condition?', subtext: 'Check for keyboard marks, dead pixels, staingate, or lines.', deductionPct: 22),
          DiagnosticCheckItem(id: 'lap-keyboard', label: 'Keyboard, Backlight & Trackpad Condition?', subtext: 'Test all keys, backlight uniformity, and trackpad haptic click.', deductionPct: 15),
          DiagnosticCheckItem(id: 'lap-battery', label: 'Battery Health & Charge Cycle Count?', subtext: 'High cycle count, Service Battery notice, or rapid drain.', deductionPct: 18),
          DiagnosticCheckItem(id: 'lap-ports', label: 'Charging Port, USB-C & HDMI Outputs?', subtext: 'USB-C/Thunderbolt charging, MagSafe, HDMI out, audio jack.', deductionPct: 12),
          DiagnosticCheckItem(id: 'lap-body', label: 'Chassis, Hinges & Dent Marks?', subtext: 'Check top lid, corners for drops, and hinge tension.', deductionPct: 12),
          DiagnosticCheckItem(id: 'lap-charger', label: 'Do you have the original power adapter?', subtext: 'Genuine OEM power adapter brick and charging cable.', deductionPct: 8),
          DiagnosticCheckItem(id: 'lap-box', label: 'Original packaging box with matching serial?', subtext: 'Original manufacturer packaging box included.', deductionPct: 5),
        ];

      case DeviceCategory.tablet:
        return const [
          DiagnosticCheckItem(id: 'tab-power', label: 'Does the tablet power on & charge normally?', subtext: 'Boots cleanly, charges steadily, and stays powered on.', deductionPct: 25),
          DiagnosticCheckItem(id: 'tab-display', label: 'Display Panel, Digitizer & Apple Pencil / Stylus?', subtext: 'Touch accuracy across all corners, digitizer latency, dead pixels.', deductionPct: 22),
          DiagnosticCheckItem(id: 'tab-body', label: 'Frame Bending, Dents & Corner Scuffs?', subtext: 'Inspect chassis flatness, frame curves, and corner impact marks.', deductionPct: 15),
          DiagnosticCheckItem(id: 'tab-battery', label: 'Battery Health & Backup Duration?', subtext: 'Check battery drainage speed under load, and battery health %.', deductionPct: 15),
          DiagnosticCheckItem(id: 'tab-cameras', label: 'Front & Rear Camera, Biometrics (Face/Touch ID)?', subtext: 'Front camera, rear camera, Face ID / fingerprint unlock.', deductionPct: 12),
          DiagnosticCheckItem(id: 'tab-ports', label: 'USB-C Port, Speakers & Microphones?', subtext: 'Clean USB-C data sync, audio clarity, and mic input.', deductionPct: 10),
          DiagnosticCheckItem(id: 'tab-water', label: 'Moisture Exposure & Liquid Damage Indicator?', subtext: 'Check for internal corrosion or triggered moisture indicator.', deductionPct: 20),
          DiagnosticCheckItem(id: 'tab-accessories', label: 'Original Charger Adapter, Cable & Box?', subtext: 'Genuine high-wattage charging adapter, cable, and packaging.', deductionPct: 6),
        ];

      case DeviceCategory.smartwatch:
        return const [
          DiagnosticCheckItem(id: 'watch-power', label: 'Does the watch boot, touch & wake on wrist raise?', subtext: 'Screen lights up, touch responds smoothly, boots to clock face.', deductionPct: 25),
          DiagnosticCheckItem(id: 'watch-display', label: 'OLED Screen, Burn-in & Scratch Condition?', subtext: 'Check for glass scratches, OLED burn-in, or edge touch dead zones.', deductionPct: 20),
          DiagnosticCheckItem(id: 'watch-sensors', label: 'Health Sensors (Heart Rate PPG, ECG, SpO2)?', subtext: 'Rear sensor glass cracks, green/red LED pulse reading accuracy.', deductionPct: 20),
          DiagnosticCheckItem(id: 'watch-crown', label: 'Digital Crown & Physical Push Buttons?', subtext: 'Haptic click rotation, side button press, ECG electrode click.', deductionPct: 12),
          DiagnosticCheckItem(id: 'watch-battery', label: 'Battery Backup & Magnetic Charger Dock?', subtext: 'Magnetic puck charging contact, full day battery backup.', deductionPct: 15),
          DiagnosticCheckItem(id: 'watch-case', label: 'Housing, Strap Latch & Water Seal?', subtext: 'Case pitting/scuffs, lug release mechanism, water resistance.', deductionPct: 12),
          DiagnosticCheckItem(id: 'watch-connectivity', label: 'Bluetooth, Cellular eSIM & GPS Lock?', subtext: 'Phone pairing reliability, notifications, standalone GPS tracking.', deductionPct: 10),
          DiagnosticCheckItem(id: 'watch-accessories', label: 'Original Magnetic Charging Cable & Box?', subtext: 'Original magnetic fast charger cable and retail packaging.', deductionPct: 8),
        ];

      case DeviceCategory.smartphone:
        return const [
          DiagnosticCheckItem(id: 'phone-power', label: 'Does the device turn on & stay awake?', subtext: 'Press the power button to verify device boots and stays powered.', deductionPct: 25),
          DiagnosticCheckItem(id: 'phone-display', label: 'How is your display & touchscreen?', subtext: 'Check for cracks, dead pixels, lines, or touch ghosting.', deductionPct: 25),
          DiagnosticCheckItem(id: 'phone-body', label: 'How is the body condition & metal frame?', subtext: 'Dents, deep scuffs, bent frame, or cracked back glass.', deductionPct: 12),
          DiagnosticCheckItem(id: 'phone-battery', label: 'Is battery maximum capacity above 85%?', subtext: 'Check Settings -> Battery -> Battery Health on iPhone/Android.', deductionPct: 12),
          DiagnosticCheckItem(id: 'phone-functional', label: 'Are all cameras, FaceID & sensors working?', subtext: 'Test optical zoom, selfie camera, FaceID/TouchID, speakers and mic.', deductionPct: 15),
          DiagnosticCheckItem(id: 'phone-water', label: 'Has the device ever had water exposure?', subtext: 'Check SIM tray liquid contact indicator (LDI) or internal moisture.', deductionPct: 20),
          DiagnosticCheckItem(id: 'phone-charger', label: 'Do you have the original charger / cable?', subtext: 'Original branded charger and fast-charging cable.', deductionPct: 6),
          DiagnosticCheckItem(id: 'phone-box', label: 'Do you have the original retail box?', subtext: 'Original manufacturer box with matching IMEI number sticker.', deductionPct: 5),
        ];
    }
  }

  static List<Map<String, String>> getPhotoAnglesForCategory(DeviceCategory category) {
    switch (category) {
      case DeviceCategory.camera:
        return const [
          {'id': 'front_mount', 'label': 'Front Body & Mount Ring'},
          {'id': 'rear_lcd', 'label': 'Rear LCD Screen (On)'},
          {'id': 'top_dials', 'label': 'Top Dials & Controls'},
          {'id': 'sensor', 'label': 'CMOS Image Sensor'},
          {'id': 'bottom_serial', 'label': 'Bottom Base & Serial Plate'},
          {'id': 'battery_bay', 'label': 'Battery Chamber & SD Slot'},
          {'id': 'side_ports', 'label': 'Side HDMI & Mic Ports'},
          {'id': 'defect', 'label': 'Scratch / Defect Close-up'},
        ];

      case DeviceCategory.lens:
        return const [
          {'id': 'front_element', 'label': 'Front Glass Element'},
          {'id': 'rear_mount', 'label': 'Rear Metal Bayonet Mount'},
          {'id': 'barrel_markings', 'label': 'Lens Barrel Markings'},
          {'id': 'aperture_blades', 'label': 'Aperture Iris Blades'},
          {'id': 'focus_ring', 'label': 'Focus & Zoom Rubber Rings'},
          {'id': 'filter_thread', 'label': 'Front Filter Thread Ring'},
          {'id': 'serial_label', 'label': 'Serial Number Label'},
          {'id': 'defect', 'label': 'Glass Scratch / Defect'},
        ];

      case DeviceCategory.laptop:
        return const [
          {'id': 'screen_on', 'label': 'Display Open (Screen On)'},
          {'id': 'keyboard_trackpad', 'label': 'Keyboard & Trackpad Area'},
          {'id': 'top_lid', 'label': 'Outer Top Lid Shell'},
          {'id': 'bottom_serial', 'label': 'Bottom Case & Serial Number'},
          {'id': 'left_ports', 'label': 'Left Charging & Type-C Ports'},
          {'id': 'right_ports', 'label': 'Right Ports & Audio Jack'},
          {'id': 'hinge_angle', 'label': 'Display Hinge Alignment'},
          {'id': 'defect', 'label': 'Dent / Scratch Close-up'},
        ];

      case DeviceCategory.tablet:
        return const [
          {'id': 'front_display', 'label': 'Front Glass (Screen On)'},
          {'id': 'back_housing', 'label': 'Back Aluminum Housing'},
          {'id': 'left_frame', 'label': 'Left Frame & Pencil Dock'},
          {'id': 'right_frame', 'label': 'Right Side & Buttons'},
          {'id': 'bottom_port', 'label': 'Bottom USB-C Port & Speaker'},
          {'id': 'top_power', 'label': 'Top Button & Microphone'},
          {'id': 'serial_screen', 'label': 'Settings About / Serial'},
          {'id': 'defect', 'label': 'Corner Dent / Scuff Close-up'},
        ];

      case DeviceCategory.smartwatch:
        return const [
          {'id': 'display_face', 'label': 'Watch Face (Screen On)'},
          {'id': 'rear_sensors', 'label': 'Rear Heart Rate Optical Sensor'},
          {'id': 'crown_side', 'label': 'Digital Crown & Side Key'},
          {'id': 'mic_side', 'label': 'Speaker & Mic Side'},
          {'id': 'top_lug', 'label': 'Top Strap Lug Mechanism'},
          {'id': 'bottom_lug', 'label': 'Bottom Strap Lug Mechanism'},
          {'id': 'serial_screen', 'label': 'Serial Number / IMEI Screen'},
          {'id': 'defect', 'label': 'Case Scratch / Glass Defect'},
        ];

      case DeviceCategory.smartphone:
        return const [
          {'id': 'front', 'label': 'Front Display (Screen On)'},
          {'id': 'back', 'label': 'Back Panel & Housing'},
          {'id': 'left', 'label': 'Left Side & Frame'},
          {'id': 'right', 'label': 'Right Side & Frame'},
          {'id': 'ports', 'label': 'Top / Bottom Ports'},
          {'id': 'camera_lens', 'label': 'Camera Lens & Optics'},
          {'id': 'imei_label', 'label': 'IMEI / Serial Screen'},
          {'id': 'defect', 'label': 'Scratch / Defect Close-up'},
        ];
    }
  }
}
