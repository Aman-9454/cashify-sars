import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export interface QuestionOption {
  id: string;
  label: string;
  sublabel: string;
  adj: number;
}

export interface CategoryQuestion {
  id: string;
  categoryId: string;
  question: string;
  subtext: string;
  active?: boolean;
  options: QuestionOption[];
}

const defaultCategoryQuestions: Record<string, CategoryQuestion[]> = {
  // ── 1. DSLR & MIRRORLESS CAMERAS ──
  'cat-dslr': [
    {
      id: 'cam-power',
      categoryId: 'cat-dslr',
      question: 'Does the camera power on & shoot normally?',
      subtext: 'Check sensor readout, shutter mechanism, dials and screen.',
      active: true,
      options: [
        { id: 'opt-pow-1', label: 'Powers on & Shoots Perfectly', sublabel: 'Normal shutter response & dials', adj: 0 },
        { id: 'opt-pow-2', label: 'Intermittent Shutter Lag', sublabel: 'Takes photos but occasional pause', adj: -3000 },
        { id: 'opt-pow-3', label: 'Does Not Power On', sublabel: 'Requires servicing / board check', adj: -8000 },
      ],
    },
    {
      id: 'cam-sensor',
      categoryId: 'cat-dslr',
      question: 'Sensor Glass & Viewfinder Condition?',
      subtext: 'Check sensor surface under direct light.',
      active: true,
      options: [
        { id: 'opt-sen-1', label: 'Pristine Flawless Sensor', sublabel: 'Zero spots, dust or scratches', adj: 2000 },
        { id: 'opt-sen-2', label: 'Minor Dust (Easily Cleaned)', sublabel: 'Standard sensor dust specks', adj: 0 },
        { id: 'opt-sen-3', label: 'Visible Scratches / Fungus', sublabel: 'Coating damage or fungus mark', adj: -5000 },
      ],
    },
    {
      id: 'cam-body',
      categoryId: 'cat-dslr',
      question: 'Body Cosmetic & Rubber Grip Condition?',
      subtext: 'Inspect body corners, tripod mount, and rubber grip.',
      active: true,
      options: [
        { id: 'opt-bod-1', label: 'Like New / Flawless', sublabel: 'No scratches, firm rubber grips', adj: 1500 },
        { id: 'opt-bod-2', label: 'Good (Minor Rub Marks)', sublabel: 'Normal cosmetic edge wear', adj: 0 },
        { id: 'opt-bod-3', label: 'Heavy Paint Wear / Peeling', sublabel: 'Loose rubber or body dings', adj: -3500 },
      ],
    },
    {
      id: 'cam-shutter',
      categoryId: 'cat-dslr',
      question: 'Estimated Shutter Actuations?',
      subtext: 'Total photos clicked with this camera body.',
      active: true,
      options: [
        { id: 'opt-shu-1', label: '< 20,000 Shutter Count', sublabel: 'Light hobbyist usage', adj: 1500 },
        { id: 'opt-shu-2', label: '20,000 - 60,000 Shutter Count', sublabel: 'Moderate regular use', adj: 0 },
        { id: 'opt-shu-3', label: '> 80,000 Shutter Count', sublabel: 'Heavy professional workload', adj: -4000 },
      ],
    },
    {
      id: 'cam-display',
      categoryId: 'cat-dslr',
      question: 'LCD Screen & Articulation / Touch?',
      subtext: 'Check screen tilt mechanism, touch response, and scratch marks.',
      active: true,
      options: [
        { id: 'opt-disp-1', label: 'Flawless Scratch-Free LCD', sublabel: 'Zero screen blemishes', adj: 1000 },
        { id: 'opt-disp-2', label: 'Hairline Micro Scratches', sublabel: 'Visible only under direct light', adj: 0 },
        { id: 'opt-disp-3', label: 'Cracked Glass / Hinge Loose', sublabel: 'Display damage or loose bracket', adj: -4000 },
      ],
    },
    {
      id: 'cam-hardware',
      categoryId: 'cat-dslr',
      question: 'Buttons, Dials & SD Card Slots?',
      subtext: 'Test all command dials, joystick, hotshoe, and SD card door.',
      active: true,
      options: [
        { id: 'opt-hw-1', label: 'All Dials & Slots 100% Crisp', sublabel: 'Perfect tactile feedback', adj: 0 },
        { id: 'opt-hw-2', label: 'Loose Port Rubber / Sticky Dial', sublabel: 'Minor physical wear', adj: -1500 },
        { id: 'opt-hw-3', label: 'Card Slot Error / Dial Unresponsive', sublabel: 'Hardware repair required', adj: -4500 },
      ],
    },
    {
      id: 'cam-autofocus',
      categoryId: 'cat-dslr',
      question: 'Autofocus Speed & Sensor Mount Communication?',
      subtext: 'Test lens mount electronic pins and phase-detection AF tracking.',
      active: true,
      options: [
        { id: 'opt-af-1', label: 'Instant Eye-AF & Pin-Sharp Lock', sublabel: 'Rapid tracking on all lenses', adj: 1000 },
        { id: 'opt-af-2', label: 'Normal Autofocus Response', sublabel: 'Standard autofocus acquisition', adj: 0 },
        { id: 'opt-af-3', label: 'AF Hunting / Mount Contact Errors', sublabel: 'Erratic lens communication', adj: -3500 },
      ],
    },
    {
      id: 'cam-water',
      categoryId: 'cat-dslr',
      question: 'Moisture, Sand or Fungus Exposure?',
      subtext: 'Check inside battery compartment and lens mount for corrosion or fungus.',
      active: true,
      options: [
        { id: 'opt-wat-1', label: 'Clean Studio Used (Zero Moisture)', sublabel: 'Dry environment maintained', adj: 0 },
        { id: 'opt-wat-2', label: 'Rain / Humidity Exposure', sublabel: 'Minor internal moisture trace', adj: -3500 },
        { id: 'opt-wat-3', label: 'Submerged / Salt Water Contact', sublabel: 'Severe internal corrosion risk', adj: -12000 },
      ],
    },
    {
      id: 'cam-battery',
      categoryId: 'cat-dslr',
      question: 'OEM Battery Health & Charge Life?',
      subtext: 'Test original manufacturer battery hold and recharge cycle life.',
      active: true,
      options: [
        { id: 'opt-bat-1', label: 'Original OEM Battery (90%+ Health)', sublabel: 'Full day continuous shooting', adj: 1000 },
        { id: 'opt-bat-2', label: 'Standard Usable Battery (Normal)', sublabel: 'Normal backup duration', adj: 0 },
        { id: 'opt-bat-3', label: 'Swollen Cell / Third-Party Battery', sublabel: 'Quick drain or aftermarket pack', adj: -2000 },
      ],
    },
    {
      id: 'cam-accessories',
      categoryId: 'cat-dslr',
      question: 'Original Charger, Battery & Packaging Box?',
      subtext: 'Original OEM battery, dedicated charger, body cap, and retail box.',
      active: true,
      options: [
        { id: 'opt-acc-1', label: 'Complete Original Box + OEM Charger + Battery', sublabel: 'Complete retail bundle', adj: 2500 },
        { id: 'opt-acc-2', label: 'Original Charger + Battery (No Box)', sublabel: 'Standard operational gear', adj: 0 },
        { id: 'opt-acc-3', label: 'Third-Party Charger Only / Missing Caps', sublabel: 'Incomplete accessory bundle', adj: -2500 },
      ],
    },
  ],

  // ── 2. CAMERA LENSES ──
  'cat-lens': [
    {
      id: 'lens-glass',
      categoryId: 'cat-lens',
      question: 'Optical Front & Rear Glass Element Condition?',
      subtext: 'Look through front & rear elements against strong light.',
      active: true,
      options: [
        { id: 'opt-lensg-1', label: 'Crystal Clear (No Fungus/Scratches)', sublabel: 'Flawless optical glass', adj: 2000 },
        { id: 'opt-lensg-2', label: 'Minor Dust Specks (No Effect on Image)', sublabel: 'Normal internal micro-dust', adj: 0 },
        { id: 'opt-lensg-3', label: 'Visible Fungus / Deep Scratch / Haze', sublabel: 'Internal coating haze or fungus', adj: -5500 },
      ],
    },
    {
      id: 'lens-motor',
      categoryId: 'cat-lens',
      question: 'Autofocus Motor & Manual Focus Ring?',
      subtext: 'Check AF lock speed, accuracy, and focus ring smoothness.',
      active: true,
      options: [
        { id: 'opt-lensm-1', label: 'Fast Silent AF & Smooth Focus Ring', sublabel: '100% operational ultrasonic/linear motor', adj: 0 },
        { id: 'opt-lensm-2', label: 'Sluggish AF / Stiff Focus Ring', sublabel: 'Slow motor response', adj: -2500 },
        { id: 'opt-lensm-3', label: 'AF Hunting Failure / Motor Dead', sublabel: 'Motor repair required', adj: -5500 },
      ],
    },
    {
      id: 'lens-aperture',
      categoryId: 'cat-lens',
      question: 'Aperture Blades & Electronic Contacts?',
      subtext: 'Inspect aperture actuation and metal mount electrical contacts.',
      active: true,
      options: [
        { id: 'opt-lensap-1', label: 'Snappy Clean Blades (No Oil)', sublabel: 'Instant diaphragm response', adj: 0 },
        { id: 'opt-lensap-2', label: 'Slow Aperture Blades / Oily Trace', sublabel: 'Sticky diaphragm mechanism', adj: -3000 },
        { id: 'opt-lensap-3', label: 'Stuck Aperture / Error 01 Contact', sublabel: 'Blades do not stop down', adj: -6000 },
      ],
    },
    {
      id: 'lens-barrel',
      categoryId: 'cat-lens',
      question: 'Lens Barrel & Rubber Zoom Ring?',
      subtext: 'Inspect metal/plastic barrel finish and rubber zoom ring grip.',
      active: true,
      options: [
        { id: 'opt-lensb-1', label: 'Pristine Barrel & Firm Rubber Ring', sublabel: 'Looks brand new', adj: 1000 },
        { id: 'opt-lensb-2', label: 'Minor Paint Rub / Normal Zoom Feel', sublabel: 'Standard careful usage', adj: 0 },
        { id: 'opt-lensb-3', label: 'Loose Expanded Rubber / Heavy Scuffs', sublabel: 'Cosmetic wear and loose grip', adj: -2000 },
      ],
    },
    {
      id: 'lens-stabilization',
      categoryId: 'cat-lens',
      question: 'Optical Image Stabilization (IS / VR / OSS)?',
      subtext: 'Check if gyro stabilization motor operates quietly without vibration jitter.',
      active: true,
      options: [
        { id: 'opt-lensis-1', label: 'Quiet & Rock-Solid IS Stabilization', sublabel: 'Stabilizer functions perfectly', adj: 0 },
        { id: 'opt-lensis-2', label: 'Buzzing Sound / Jittery Gyro IS', sublabel: 'Stabilizer element struggling', adj: -3500 },
        { id: 'opt-lensis-3', label: 'Lens Does Not Have IS (Non-IS Lens)', sublabel: 'Prime or native unstabilized', adj: 0 },
      ],
    },
    {
      id: 'lens-mount',
      categoryId: 'cat-lens',
      question: 'Metal Bayonet Mount & Weather Gasket?',
      subtext: 'Check mount locking lugs, screw tightness, and rubber weather gasket.',
      active: true,
      options: [
        { id: 'opt-lensmt-1', label: 'Pristine Chrome/Brass Mount & Gasket', sublabel: 'Locks firmly onto camera', adj: 0 },
        { id: 'opt-lensmt-2', label: 'Slight Mount Rub Marks / Torn Gasket', sublabel: 'Minor mount wear', adj: -1000 },
        { id: 'opt-lensmt-3', label: 'Bent Mount Flange / Loose Screws', sublabel: 'Does not mount securely', adj: -4000 },
      ],
    },
    {
      id: 'lens-filter',
      categoryId: 'cat-lens',
      question: 'Front Filter Thread & Multi-Coating?',
      subtext: 'Check front filter ring threads for dents or cross-threading.',
      active: true,
      options: [
        { id: 'opt-lensf-1', label: 'Flawless Thread (Filters Screw On Smoothly)', sublabel: 'Perfect circular thread', adj: 500 },
        { id: 'opt-lensf-2', label: 'Minor Thread Scuff (Filter Still Fits)', sublabel: 'Usable with slight resistance', adj: 0 },
        { id: 'opt-lensf-3', label: 'Dented Rim / Cross-Threaded (Filter Cannot Screw)', sublabel: 'Impact damage to front rim', adj: -2500 },
      ],
    },
    {
      id: 'lens-hood',
      categoryId: 'cat-lens',
      question: 'Original Lens Hood, Front & Rear Caps?',
      subtext: 'Original bayonet lens hood and original brand protective caps.',
      active: true,
      options: [
        { id: 'opt-lensh-1', label: 'Original Hood + Front & Rear Caps', sublabel: 'Complete protective accessories', adj: 1500 },
        { id: 'opt-lensh-2', label: 'Front & Rear Caps Only (No Hood)', sublabel: 'Essential lens protection only', adj: 0 },
        { id: 'opt-lensh-3', label: 'Missing Caps / Third-Party Caps', sublabel: 'No original caps or hood', adj: -1000 },
      ],
    },
    {
      id: 'lens-box',
      categoryId: 'cat-lens',
      question: 'Original Retail Packaging Box & Pouch?',
      subtext: 'Original lens packaging box with foam inserts and soft pouch.',
      active: true,
      options: [
        { id: 'opt-lensbx-1', label: 'Original Box + Factory Pouch Included', sublabel: 'Collector-grade complete package', adj: 1000 },
        { id: 'opt-lensbx-2', label: 'Lens Only (No Original Box)', sublabel: 'Standard lens without outer packaging', adj: 0 },
      ],
    },
  ],

  // ── 3. SMARTPHONES ──
  'cat-smartphone': [
    {
      id: 'phone-power',
      categoryId: 'cat-smartphone',
      question: 'Does the device turn on & stay awake?',
      subtext: 'Press the power button to verify device boots and stays powered.',
      active: true,
      options: [
        { id: 'opt-ppow-1', label: 'Yes, Turns on & Works Normally', sublabel: 'Boots cleanly to home screen', adj: 0 },
        { id: 'opt-ppow-2', label: 'Restarts Frequently / Boot Loops', sublabel: 'Software or motherboard issue', adj: -8000 },
        { id: 'opt-ppow-3', label: 'Dead / Does Not Power On', sublabel: 'Completely unpowered unit', adj: -18000 },
      ],
    },
    {
      id: 'phone-display',
      categoryId: 'cat-smartphone',
      question: 'How is your display & touchscreen?',
      subtext: 'Check for cracks, dead pixels, lines, or touch ghosting.',
      active: true,
      options: [
        { id: 'opt-pdisp-1', label: 'Flawless (No Scratches / Original)', sublabel: 'Zero marks, original panel', adj: 2000 },
        { id: 'opt-pdisp-2', label: 'Minor Hairline Scratches', sublabel: 'Not visible during everyday use', adj: 0 },
        { id: 'opt-pdisp-3', label: 'Deep Scratches / Minor Glass Crack', sublabel: 'Touch working but glass chipped', adj: -4500 },
        { id: 'opt-pdisp-4', label: 'Broken Panel / Lines / Bleeding', sublabel: 'Panel replacement needed', adj: -10000 },
      ],
    },
    {
      id: 'phone-body',
      categoryId: 'cat-smartphone',
      question: 'How is the body condition & metal frame?',
      subtext: 'Dents, deep scuffs, bent frame, or cracked back glass.',
      active: true,
      options: [
        { id: 'opt-pbod-1', label: 'Like New (Always in Case)', sublabel: 'Zero scratches or frame dings', adj: 1500 },
        { id: 'opt-pbod-2', label: 'Good (Minor Edge Rub Marks)', sublabel: 'Normal everyday pocket wear', adj: 0 },
        { id: 'opt-pbod-3', label: 'Multiple Dents / Scratches', sublabel: 'Visible body impacts', adj: -2500 },
        { id: 'opt-pbod-4', label: 'Cracked Back Glass / Bent Chassis', sublabel: 'Structural frame damage', adj: -6000 },
      ],
    },
    {
      id: 'phone-battery',
      categoryId: 'cat-smartphone',
      question: 'Is battery maximum capacity above 85%?',
      subtext: 'Check Settings -> Battery -> Battery Health on iPhone/Android.',
      active: true,
      options: [
        { id: 'opt-pbat-1', label: 'Yes, 90% – 100% Health', sublabel: 'Outstanding full-day endurance', adj: 2000 },
        { id: 'opt-pbat-2', label: '80% – 89% Health (Normal)', sublabel: 'Standard healthy battery life', adj: 0 },
        { id: 'opt-pbat-3', label: 'Below 80% / Service Alert', sublabel: 'Battery replacement prompt shown', adj: -3000 },
      ],
    },
    {
      id: 'phone-functional',
      categoryId: 'cat-smartphone',
      question: 'Are all cameras & optical zoom lenses working?',
      subtext: 'Test wide, ultra-wide, telephoto zoom, selfie and autofocus.',
      active: true,
      options: [
        { id: 'opt-pfunc-1', label: 'All Cameras Crystal Clear & Fast AF', sublabel: 'Optical stabilization & focus pristine', adj: 0 },
        { id: 'opt-pfunc-2', label: 'One Lens Blurry or Scratched Glass', sublabel: 'Secondary camera lens issue', adj: -3000 },
        { id: 'opt-pfunc-3', label: 'Camera App Crashes / OIS Rattle', sublabel: 'Sensor replacement needed', adj: -6500 },
      ],
    },
    {
      id: 'phone-biometrics',
      categoryId: 'cat-smartphone',
      question: 'FaceID, Fingerprint & TrueTone Active?',
      subtext: 'Test biometric unlocking and true tone display calibration.',
      active: true,
      options: [
        { id: 'opt-pbio-1', label: 'FaceID / Fingerprint & TrueTone 100% Working', sublabel: 'Instant biometric recognition', adj: 1000 },
        { id: 'opt-pbio-2', label: 'TrueTone Inactive (Display Replaced)', sublabel: 'Non-OEM display calibration', adj: -2000 },
        { id: 'opt-pbio-3', label: 'FaceID / Fingerprint Hardware Failure', sublabel: 'Biometric hardware sensor unavailable', adj: -4500 },
      ],
    },
    {
      id: 'phone-connectivity',
      categoryId: 'cat-smartphone',
      question: 'Wi-Fi, Bluetooth, Mobile Network & Speakers?',
      subtext: 'Test dual SIM / eSIM, Wi-Fi 6, microphones and stereo speakers.',
      active: true,
      options: [
        { id: 'opt-pcon-1', label: 'All Wireless & Stereo Speakers Loud & Crisp', sublabel: 'Full signal on cellular & Wi-Fi', adj: 0 },
        { id: 'opt-pcon-2', label: 'Muffled Earpiece Speaker / Low Mic', sublabel: 'Minor dust or acoustic grille wear', adj: -1500 },
        { id: 'opt-pcon-3', label: 'No SIM Signal / Wi-Fi Greyed Out', sublabel: 'Baseband or wireless chip fault', adj: -8000 },
      ],
    },
    {
      id: 'phone-water',
      categoryId: 'cat-smartphone',
      question: 'Has the device ever had water exposure?',
      subtext: 'Check SIM tray liquid contact indicator (LDI) or internal moisture.',
      active: true,
      options: [
        { id: 'opt-pwat-1', label: 'No Water Damage (Never Submerged)', sublabel: 'Completely dry and clean', adj: 0 },
        { id: 'opt-pwat-2', label: 'Yes, Water Contact / Red LDI Indicator', sublabel: 'Internal corrosion risk', adj: -12000 },
      ],
    },
    {
      id: 'phone-charger',
      categoryId: 'cat-smartphone',
      question: 'Do you have the original charger / cable?',
      subtext: 'Original branded charger and fast-charging cable.',
      active: true,
      options: [
        { id: 'opt-pchg-1', label: 'Yes, Original Fast Charger & Cable', sublabel: 'Original high-wattage gear', adj: 600 },
        { id: 'opt-pchg-2', label: 'No Charger / Cable Only', sublabel: 'Charger brick not provided', adj: 0 },
      ],
    },
    {
      id: 'phone-box',
      categoryId: 'cat-smartphone',
      question: 'Do you have the original retail box?',
      subtext: 'Original manufacturer box with matching IMEI number sticker.',
      active: true,
      options: [
        { id: 'opt-pbox-1', label: 'Yes, Original Box with Matching IMEI', sublabel: 'Verified genuine packaging', adj: 500 },
        { id: 'opt-pbox-2', label: 'No Original Box', sublabel: 'Device only without retail box', adj: 0 },
      ],
    },
  ],

  // ── 4. LAPTOPS & MACBOOKS ──
  'cat-laptop': [
    {
      id: 'lap-power',
      categoryId: 'cat-laptop',
      question: 'Does the laptop boot into OS and sleep/wake normally?',
      subtext: 'Powers on without chime failure or unexpected shutdowns.',
      active: true,
      options: [
        { id: 'opt-lpow-1', label: 'Boots Fast & Runs Normal', sublabel: 'No kernel panics or blue screens', adj: 0 },
        { id: 'opt-lpow-2', label: 'Random Shutdowns / Freezes', sublabel: 'Thermal or logic board issue', adj: -7000 },
        { id: 'opt-lpow-3', label: 'No Power / Black Screen Only', sublabel: 'Major motherboard failure', adj: -20000 },
      ],
    },
    {
      id: 'lap-display',
      categoryId: 'cat-laptop',
      question: 'Screen & Anti-Reflective Coating Condition?',
      subtext: 'Check for keyboard marks, dead pixels, staingate, or lines.',
      active: true,
      options: [
        { id: 'opt-ldisp-1', label: 'Pristine Flawless Display', sublabel: 'No dead pixels or delamination', adj: 2000 },
        { id: 'opt-ldisp-2', label: 'Keyboard Imprints / Micro Scratches', sublabel: 'Visible only under direct light', adj: 0 },
        { id: 'opt-ldisp-3', label: 'Cracked Panel / Lines / Staingate', sublabel: 'Screen replacement needed', adj: -8500 },
      ],
    },
    {
      id: 'lap-keyboard',
      categoryId: 'cat-laptop',
      question: 'Keyboard, Backlight & Trackpad Condition?',
      subtext: 'Test all keys, backlight uniformity, and trackpad haptic click.',
      active: true,
      options: [
        { id: 'opt-lkb-1', label: 'All Keys & Touchpad Perfect', sublabel: 'Smooth typing & gestures', adj: 0 },
        { id: 'opt-lkb-2', label: 'Sticky / Stiff Keys', sublabel: 'Minor key resistance', adj: -2500 },
        { id: 'opt-lkb-3', label: 'Trackpad Defect / Broken Backlight', sublabel: 'Click or haptic unresponsive', adj: -4500 },
      ],
    },
    {
      id: 'lap-body',
      categoryId: 'cat-laptop',
      question: 'Aluminum Body, Hinges & Corners?',
      subtext: 'Inspect hinge tension, lid alignment, port wear, and bottom plate.',
      active: true,
      options: [
        { id: 'opt-lbod-1', label: 'Mint / Solid Hinges', sublabel: 'Smooth opening & closing', adj: 1500 },
        { id: 'opt-lbod-2', label: 'Minor Edge Scuffs', sublabel: 'Cosmetic edge rub', adj: 0 },
        { id: 'opt-lbod-3', label: 'Heavy Dent / Loose Hinge', sublabel: 'Chassis deformity', adj: -4500 },
      ],
    },
    {
      id: 'lap-battery',
      categoryId: 'cat-laptop',
      question: 'Battery Health & Cycle Performance?',
      subtext: 'Check battery cycle count and backup duration.',
      active: true,
      options: [
        { id: 'opt-lbat-1', label: 'Original Battery with 6+ Hours Backup', sublabel: 'Excellent battery longevity', adj: 2000 },
        { id: 'opt-lbat-2', label: 'Normal Battery Backup (3-5 Hours)', sublabel: 'Standard usable condition', adj: 0 },
        { id: 'opt-lbat-3', label: 'Service Battery Warning / Swollen', sublabel: 'Immediate replacement needed', adj: -5000 },
      ],
    },
    {
      id: 'lap-hardware',
      categoryId: 'cat-laptop',
      question: 'Webcam, Speakers, Wi-Fi & USB-C Ports?',
      subtext: 'Check microphone, headphone jack, Thunderbolt/USB-C ports.',
      active: true,
      options: [
        { id: 'opt-lhw-1', label: 'All Ports, Speakers & Webcam Crisp', sublabel: '100% operational hardware', adj: 0 },
        { id: 'opt-lhw-2', label: 'One Loose USB Port or Crackly Speaker', sublabel: 'Minor hardware wear', adj: -2500 },
        { id: 'opt-lhw-3', label: 'Wi-Fi / Webcam Defect', sublabel: 'Internal ribbon cable failure', adj: -4500 },
      ],
    },
    {
      id: 'lap-cooling',
      categoryId: 'cat-laptop',
      question: 'Cooling Fans, Temperature & Thermal Noise?',
      subtext: 'Test thermal performance under normal application load.',
      active: true,
      options: [
        { id: 'opt-lcool-1', label: 'Whisper-Quiet & Cool Operation', sublabel: 'Zero fan rattle or throttling', adj: 1000 },
        { id: 'opt-lcool-2', label: 'Normal Fan Noise Under Load', sublabel: 'Standard thermal ramp-up', adj: 0 },
        { id: 'opt-lcool-3', label: 'Loud Fan Grinding / Overheating Shutdown', sublabel: 'Fan bearing or heatsink defect', adj: -3500 },
      ],
    },
    {
      id: 'lap-storage',
      categoryId: 'cat-laptop',
      question: 'SSD Storage Health & Read/Write Speeds?',
      subtext: 'Check SMART SSD diagnostic health and OS drive partitions.',
      active: true,
      options: [
        { id: 'opt-lssd-1', label: '100% SMART SSD Health', sublabel: 'Lightning-fast boot & app loading', adj: 1000 },
        { id: 'opt-lssd-2', label: 'Normal SSD Health (Good Status)', sublabel: 'Standard storage speed', adj: 0 },
        { id: 'opt-lssd-3', label: 'Failing Drive / Bad Blocks / Slow Read', sublabel: 'Drive replacement required', adj: -5000 },
      ],
    },
    {
      id: 'lap-charger',
      categoryId: 'cat-laptop',
      question: 'Original High-Wattage Power Adapter?',
      subtext: 'Original MagSafe or USB-C power brick with cable.',
      active: true,
      options: [
        { id: 'opt-lchg-1', label: 'Original OEM Fast Charger Included', sublabel: 'Genuine branded charger', adj: 1000 },
        { id: 'opt-lchg-2', label: 'Third-Party Charger / No Charger', sublabel: 'Missing genuine power adapter', adj: -1500 },
      ],
    },
    {
      id: 'lap-box',
      categoryId: 'cat-laptop',
      question: 'Original Packaging Box Available?',
      subtext: 'Original branded box with matching serial numbers.',
      active: true,
      options: [
        { id: 'opt-lbox-1', label: 'Yes, Original Retail Box Included', sublabel: 'Complete packaging available', adj: 600 },
        { id: 'opt-lbox-2', label: 'No Original Box', sublabel: 'Laptop and charger only', adj: 0 },
      ],
    },
  ],

  // ── 5. TABLETS & IPADS ──
  'cat-tablet': [
    {
      id: 'tab-power',
      categoryId: 'cat-tablet',
      question: 'Does the tablet boot into iPadOS / Android smoothly?',
      subtext: 'Powers on instantly to home screen without boot-loops or freezing.',
      active: true,
      options: [
        { id: 'opt-tpow-1', label: 'Boots Fast & Runs Silky Smooth', sublabel: 'Immediate wake & fluid apps', adj: 0 },
        { id: 'opt-tpow-2', label: 'Laggy Performance / Occasional Freezing', sublabel: 'Minor software stutter', adj: -3000 },
        { id: 'opt-tpow-3', label: 'Does Not Turn On / Bootloop', sublabel: 'Motherboard or battery failure', adj: -12000 },
      ],
    },
    {
      id: 'tab-screen',
      categoryId: 'cat-tablet',
      question: 'Display Glass & Stylus / Apple Pencil Support?',
      subtext: 'Check Liquid Retina glass for scratches and test stylus digitizer.',
      active: true,
      options: [
        { id: 'opt-tdisp-1', label: 'Pristine Flawless Glass & Full Stylus Support', sublabel: '100% responsive touch & pencil', adj: 2000 },
        { id: 'opt-tdisp-2', label: 'Hairline Micro-Scratches (No Touch Deadzone)', sublabel: 'Normal everyday surface marks', adj: 0 },
        { id: 'opt-tdisp-3', label: 'Chipped Corner Glass / Stylus Jitter', sublabel: 'Minor touch digitizer issue', adj: -4500 },
        { id: 'opt-tdisp-4', label: 'Cracked Glass / Black Spots / Lines', sublabel: 'Panel replacement needed', adj: -9000 },
      ],
    },
    {
      id: 'tab-chassis',
      categoryId: 'cat-tablet',
      question: 'Aluminum Chassis & Table Flatness Bend Test?',
      subtext: 'Place tablet face-down on a flat surface to check for frame bending.',
      active: true,
      options: [
        { id: 'opt-tbod-1', label: '100% Perfectly Flat & Dent-Free', sublabel: 'No curve or corner impact', adj: 1500 },
        { id: 'opt-tbod-2', label: 'Minor Cosmetic Edge Rubs / Normal Use', sublabel: 'Slight case rub marks', adj: 0 },
        { id: 'opt-tbod-3', label: 'Noticeable Frame Bend / Heavy Corner Ding', sublabel: 'Chassis warp detected', adj: -4500 },
      ],
    },
    {
      id: 'tab-battery',
      categoryId: 'cat-tablet',
      question: 'Battery Health & Daily Screen-On Time?',
      subtext: 'Test continuous battery life for multimedia and note taking.',
      active: true,
      options: [
        { id: 'opt-tbat-1', label: 'Full Day Battery Life (8+ Hours On-Screen)', sublabel: '90%+ battery efficiency', adj: 1500 },
        { id: 'opt-tbat-2', label: 'Standard Usable Backup (4-6 Hours)', sublabel: 'Normal tablet endurance', adj: 0 },
        { id: 'opt-tbat-3', label: 'Drains Fast (< 2 Hours) / Swollen Pack', sublabel: 'Battery service required', adj: -4000 },
      ],
    },
    {
      id: 'tab-biometrics',
      categoryId: 'cat-tablet',
      question: 'FaceID / TouchID & TrueTone Functionality?',
      subtext: 'Test biometric sensors and ambient light display calibration.',
      active: true,
      options: [
        { id: 'opt-tbio-1', label: 'FaceID / TouchID & TrueTone 100% Working', sublabel: 'Instant unlock verification', adj: 1000 },
        { id: 'opt-tbio-2', label: 'TrueTone Disabled (Non-Genuine Screen)', sublabel: 'Display calibration missing', adj: -2000 },
        { id: 'opt-tbio-3', label: 'FaceID or Fingerprint Hardware Failed', sublabel: 'Biometric sensor failure', adj: -4000 },
      ],
    },
    {
      id: 'tab-speakers-camera',
      categoryId: 'cat-tablet',
      question: 'Quad Stereo Speakers, Microphones & Cameras?',
      subtext: 'Check center-stage front camera, rear lens, and speaker loudness.',
      active: true,
      options: [
        { id: 'opt-tsnd-1', label: 'All 4 Speakers Loud & Cameras Pristine', sublabel: 'Full rich acoustic audio', adj: 0 },
        { id: 'opt-tsnd-2', label: 'Muffled Speaker / Camera Lens Scratched', sublabel: 'Minor acoustic wear', adj: -2000 },
        { id: 'opt-tsnd-3', label: 'No Sound Output / Camera App Error', sublabel: 'Audio/camera hardware fault', adj: -4500 },
      ],
    },
    {
      id: 'tab-ports',
      categoryId: 'cat-tablet',
      question: 'USB-C / Lightning Port & Smart Connector?',
      subtext: 'Check snug charging connection and magnetic keyboard pins.',
      active: true,
      options: [
        { id: 'opt-tprt-1', label: 'Snug Port Connection & Keyboard Pins Crisp', sublabel: '100% charging and accessory connect', adj: 0 },
        { id: 'opt-tprt-2', label: 'Loose Cable Fit (Needs Specific Angle)', sublabel: 'Port lint or wear', adj: -1500 },
        { id: 'opt-tprt-3', label: 'Port Completely Defective / No Charge', sublabel: 'Charging port board damage', adj: -5000 },
      ],
    },
    {
      id: 'tab-connectivity',
      categoryId: 'cat-tablet',
      question: 'Wi-Fi, Bluetooth & Cellular SIM / eSIM Status?',
      subtext: 'Verify high-speed wireless connectivity and carrier unlocked state.',
      active: true,
      options: [
        { id: 'opt-tcon-1', label: 'Full Wireless Signal & Unlocked Cellular', sublabel: 'Zero network restrictions', adj: 0 },
        { id: 'opt-tcon-2', label: 'Wi-Fi Only Model (Factory Wi-Fi Variant)', sublabel: 'Standard Wi-Fi tablet', adj: 0 },
        { id: 'opt-tcon-3', label: 'Wi-Fi Hardware Error / Greyed Out', sublabel: 'Wireless module failed', adj: -6000 },
      ],
    },
    {
      id: 'tab-charger',
      categoryId: 'cat-tablet',
      question: 'Original Fast Charger & Braided Cable Included?',
      subtext: 'Original high-power USB-C adapter and charging lead.',
      active: true,
      options: [
        { id: 'opt-tchg-1', label: 'Original OEM Fast Charger & Cable', sublabel: 'Genuine branded charger bundle', adj: 800 },
        { id: 'opt-tchg-2', label: 'Third-Party Cable / No Adapter', sublabel: 'Missing original fast charger', adj: -800 },
      ],
    },
    {
      id: 'tab-box',
      categoryId: 'cat-tablet',
      question: 'Original Packaging Box Available?',
      subtext: 'Original retail iPad/Tablet packaging box with serial number.',
      active: true,
      options: [
        { id: 'opt-tbox-1', label: 'Yes, Original Retail Box Included', sublabel: 'Complete retail packaging', adj: 600 },
        { id: 'opt-tbox-2', label: 'No Original Box', sublabel: 'Tablet unit only', adj: 0 },
      ],
    },
  ],

  // ── 6. ACTION CAMERAS ──
  'cat-action-camera': [
    {
      id: 'act-power',
      categoryId: 'cat-action-camera',
      question: 'Powers on, records 4K/5.3K video & stays stable?',
      subtext: 'Record 5 minutes of high-resolution video to check thermal stability.',
      active: true,
      options: [
        { id: 'opt-apow-1', label: 'Powers On Instantly & Records Continuously', sublabel: 'Zero thermal crashes or freeze', adj: 0 },
        { id: 'opt-apow-2', label: 'Freezes Occasionally During 4K/60fps', sublabel: 'Thermal or SD buffer lag', adj: -2500 },
        { id: 'opt-apow-3', label: 'Will Not Power On / Shuts Off Immediately', sublabel: 'Battery board or logic fault', adj: -7000 },
      ],
    },
    {
      id: 'act-screens',
      categoryId: 'cat-action-camera',
      question: 'Front & Rear Touchscreen Displays?',
      subtext: 'Check front preview display and rear capacitive touchscreen responsiveness.',
      active: true,
      options: [
        { id: 'opt-ascr-1', label: 'Both Displays Scratch-Free & Responsive', sublabel: '100% responsive touch gestures', adj: 1000 },
        { id: 'opt-ascr-2', label: 'Minor Surface Scuffs on Screen Glass', sublabel: 'Touch working perfectly', adj: 0 },
        { id: 'opt-ascr-3', label: 'Cracked Screen Glass / Dead Touch Zones', sublabel: 'Screen replacement required', adj: -3500 },
      ],
    },
    {
      id: 'act-lens-cover',
      categoryId: 'cat-action-camera',
      question: 'Protective Lens Cover & Optical Glass Condition?',
      subtext: 'Inspect replaceable front lens cover or 360-degree bulbous lenses.',
      active: true,
      options: [
        { id: 'opt-alns-1', label: 'Crystal Clear (No Scratches / Fungus)', sublabel: 'Sharp video footage', adj: 1000 },
        { id: 'opt-alns-2', label: 'Minor Rim Rub (Glass Clear)', sublabel: 'Does not affect recorded footage', adj: 0 },
        { id: 'opt-alns-3', label: 'Deep Scratches on Lens Glass', sublabel: 'Visible flare / streak in video', adj: -3000 },
      ],
    },
    {
      id: 'act-waterproof',
      categoryId: 'cat-action-camera',
      question: 'Waterproof Seals, Battery Door & Port Latches?',
      subtext: 'Check blue/orange rubber silicone gaskets on battery and USB doors.',
      active: true,
      options: [
        { id: 'opt-awat-1', label: 'All Rubber Seals & Latches 100% Airtight', sublabel: 'Submersible without housing', adj: 0 },
        { id: 'opt-awat-2', label: 'Worn Gasket Rubber / Stiff Latch', sublabel: 'Housing recommended for water', adj: -1500 },
        { id: 'opt-awat-3', label: 'Missing Battery Door / Torn Gasket', sublabel: 'Zero waterproof protection', adj: -3000 },
      ],
    },
    {
      id: 'act-card-slot',
      categoryId: 'cat-action-camera',
      question: 'MicroSD Card Recognition & High Bitrate Writing?',
      subtext: 'Test recognition of V30/A2 MicroSD cards and spring eject mechanism.',
      active: true,
      options: [
        { id: 'opt-acrd-1', label: 'Card Reads Instantly & Spring Ejects Smoothly', sublabel: '100% media reliability', adj: 0 },
        { id: 'opt-acrd-2', label: 'Sticky Spring Eject (Card Reads OK)', sublabel: 'Minor mechanical wear', adj: -1000 },
        { id: 'opt-acrd-3', label: 'SD Card Error / Slot Broken', sublabel: 'Cannot record to memory card', adj: -5000 },
      ],
    },
    {
      id: 'act-audio',
      categoryId: 'cat-action-camera',
      question: 'Microphone Array & Wind-Reduction Audio?',
      subtext: 'Check directional microphone audio quality and water-drain mic mesh.',
      active: true,
      options: [
        { id: 'opt-aand-1', label: 'Crystal Clear Spatial Stereo Audio', sublabel: 'No static or muffled distortion', adj: 0 },
        { id: 'opt-aand-2', label: 'Muffled Audio (Dry Clean Needed)', sublabel: 'Debris in microphone port', adj: -1000 },
        { id: 'opt-aand-3', label: 'Distorted Audio / Constant Hissing', sublabel: 'Microphone capsule water damaged', adj: -3000 },
      ],
    },
    {
      id: 'act-connectivity',
      categoryId: 'cat-action-camera',
      question: 'Quick-App Wireless Wi-Fi & Bluetooth Live Stream?',
      subtext: 'Test connection to GoPro Quik, DJI Mimo, or Insta360 mobile app.',
      active: true,
      options: [
        { id: 'opt-awir-1', label: 'Fast Pairing & Smooth Live Preview', sublabel: 'High speed wireless file offload', adj: 0 },
        { id: 'opt-awir-2', label: 'Intermittent Wi-Fi Disconnects', sublabel: 'Slight wireless delay', adj: -1500 },
        { id: 'opt-awir-3', label: 'Bluetooth / Wi-Fi Module Dead', sublabel: 'Cannot sync with mobile phone', adj: -4000 },
      ],
    },
    {
      id: 'act-battery',
      categoryId: 'cat-action-camera',
      question: 'Enduro / High-Capacity Battery Endurance?',
      subtext: 'Check battery swelling, charge hold, and door slide fit.',
      active: true,
      options: [
        { id: 'opt-abat-1', label: 'Original Enduro / Extreme Battery (Healthy)', sublabel: 'Normal 60-90 min 4K run time', adj: 1000 },
        { id: 'opt-abat-2', label: 'Standard Usable Battery (Normal Age)', sublabel: 'Moderate recording endurance', adj: 0 },
        { id: 'opt-abat-3', label: 'Swollen Cell (Difficult to Remove)', sublabel: 'Immediate disposal required', adj: -2000 },
      ],
    },
    {
      id: 'act-mounts',
      categoryId: 'cat-action-camera',
      question: 'Folding Mounting Fingers & Body Cage?',
      subtext: 'Inspect folding magnetic feet or 1/4"-20 mounting threads.',
      active: true,
      options: [
        { id: 'opt-amnt-1', label: 'Firm Solid Mounting Fingers (Zero Play)', sublabel: 'Locks rigidly onto mounts', adj: 500 },
        { id: 'opt-amnt-2', label: 'Slight Play in Folding Fingers', sublabel: 'Usable with screw tightening', adj: 0 },
        { id: 'opt-amnt-3', label: 'Broken Mounting Finger / Stripped Thread', sublabel: 'Cannot mount camera safely', adj: -2500 },
      ],
    },
    {
      id: 'act-box',
      categoryId: 'cat-action-camera',
      question: 'Original Packaging Box, USB-C Cable & Mounts?',
      subtext: 'Original retail box, charging cable, and adhesive mounting buckle.',
      active: true,
      options: [
        { id: 'opt-abox-1', label: 'Original Box + Cable + Mounting Buckle', sublabel: 'Complete factory kit', adj: 1000 },
        { id: 'opt-abox-2', label: 'Action Camera + Battery Only', sublabel: 'Camera body without retail box', adj: 0 },
      ],
    },
  ],

  // ── 7. PROFESSIONAL VIDEO CAMERAS ──
  'cat-video-camera': [
    {
      id: 'vid-power',
      categoryId: 'cat-video-camera',
      question: 'System Boot, Cooling Fan & Continuous Record Test?',
      subtext: 'Check system initialization, internal cooling fan, and tally lights.',
      active: true,
      options: [
        { id: 'opt-vpow-1', label: 'Boots Fast with Quiet Cooling Fan & Record', sublabel: '100% broadcast grade reliability', adj: 0 },
        { id: 'opt-vpow-2', label: 'Noisy Cooling Fan / Slow Boot', sublabel: 'Dust accumulation in intake', adj: -4000 },
        { id: 'opt-vpow-3', label: 'System Error Alert / Overheat Shutdown', sublabel: 'Internal motherboard failure', adj: -15000 },
      ],
    },
    {
      id: 'vid-sensor-nd',
      categoryId: 'cat-video-camera',
      question: 'Super35/Full-Frame Sensor & Built-in ND Filters?',
      subtext: 'Test motorized ND filter wheel (Clear, 2, 4, 6-stops) and sensor glass.',
      active: true,
      options: [
        { id: 'opt-vsnd-1', label: 'Flawless Sensor & Smooth Motorized ND Wheel', sublabel: 'Zero spots, silky ND transitions', adj: 3000 },
        { id: 'opt-vsnd-2', label: 'Minor Sensor Dust (Easily Cleanable)', sublabel: 'Normal studio maintenance', adj: 0 },
        { id: 'opt-vsnd-3', label: 'Stuck ND Filter Turret / Scratched Sensor Glass', sublabel: 'Expensive optical repair required', adj: -12000 },
      ],
    },
    {
      id: 'vid-card-slots',
      categoryId: 'cat-video-camera',
      question: 'Dual Media Card Slots (SD / CFexpress / CFast)?',
      subtext: 'Verify simultaneous relay and backup recording across both slots.',
      active: true,
      options: [
        { id: 'opt-vcrd-1', label: 'Both Slots Write 4K ProRes/RAW Flawlessly', sublabel: 'High speed dual recording verified', adj: 0 },
        { id: 'opt-vcrd-2', label: 'Slot 1 Working, Slot 2 Intermittent', sublabel: 'Single slot functional', adj: -4500 },
        { id: 'opt-vcrd-3', label: 'Card Recognition Failure on Both Slots', sublabel: 'Media I/O board failure', adj: -10000 },
      ],
    },
    {
      id: 'vid-audio-xlr',
      categoryId: 'cat-video-camera',
      question: 'Dual XLR Audio Inputs & 48V Phantom Power?',
      subtext: 'Test mic/line levels, physical gain dials, and headphone monitoring jack.',
      active: true,
      options: [
        { id: 'opt-vxlr-1', label: 'Pristine Low-Noise XLR Audio & 48V Power', sublabel: 'Clean audio recording across channels', adj: 1500 },
        { id: 'opt-vxlr-2', label: 'Slight Potentiometer Scratch on Gain Dial', sublabel: 'Minor physical dial wear', adj: -1500 },
        { id: 'opt-vxlr-3', label: 'No Audio on Channel / Phantom Power Dead', sublabel: 'Audio board repair required', adj: -6000 },
      ],
    },
    {
      id: 'vid-ports',
      categoryId: 'cat-video-camera',
      question: '12G-SDI, Clean HDMI & Timecode Out?',
      subtext: 'Test video output to external monitor / recorder without signal drop.',
      active: true,
      options: [
        { id: 'opt-vprt-1', label: 'Solid SDI & HDMI Output Feed (Zero Drop)', sublabel: 'All professional output ports crisp', adj: 1000 },
        { id: 'opt-vprt-2', label: 'Loose HDMI Port (Needs Snug Cable)', sublabel: 'Port connector strain', adj: -3000 },
        { id: 'opt-vprt-3', label: 'No Video Signal from HDMI / SDI Port', sublabel: 'Main output transmitter blown', adj: -9000 },
      ],
    },
    {
      id: 'vid-monitor',
      categoryId: 'cat-video-camera',
      question: 'High-Bright LCD Monitor & OLED Viewfinder (EVF)?',
      subtext: 'Check articulating screen hinge, color accuracy, and EVF diopter.',
      active: true,
      options: [
        { id: 'opt-vmon-1', label: 'Razor-Sharp Screen & Flawless EVF Diopter', sublabel: 'Peaking and waveforms 100% clear', adj: 1000 },
        { id: 'opt-vmon-2', label: 'Loose Monitor Hinge (Display Working)', sublabel: 'Minor hinge bracket wear', adj: -2000 },
        { id: 'opt-vmon-3', label: 'Dead EVF / Display Ribbon Cable Broken', sublabel: 'Screen replacement required', adj: -7500 },
      ],
    },
    {
      id: 'vid-zoom-rocker',
      categoryId: 'cat-video-camera',
      question: 'Servo Zoom Rocker & Top Handle Trigger?',
      subtext: 'Check variable speed zoom rocker smoothness and record button tactile.',
      active: true,
      options: [
        { id: 'opt-vzm-1', label: 'Silky Variable Speed Zoom & Crisp Rec Trigger', sublabel: 'Smooth zoom creep to fast zoom', adj: 0 },
        { id: 'opt-vzm-2', label: 'Slightly Stiff Zoom Rocker', sublabel: 'Normal mechanical feel', adj: -1500 },
        { id: 'opt-vzm-3', label: 'Zoom Rocker Defective / Non-Responsive', sublabel: 'Rocker switch replacement needed', adj: -4000 },
      ],
    },
    {
      id: 'vid-body',
      categoryId: 'cat-video-camera',
      question: 'Magnesium Alloy Body & 1/4"-20 Cage Mounts?',
      subtext: 'Inspect camera chassis, top handle mount, and tripod baseplate threads.',
      active: true,
      options: [
        { id: 'opt-vbod-1', label: 'Mint Condition & Clean Unstripped Threads', sublabel: 'Production-ready condition', adj: 1500 },
        { id: 'opt-vbod-2', label: 'Normal Production Paint Rub & Scuffs', sublabel: 'Careful broadcast usage', adj: 0 },
        { id: 'opt-vbod-3', label: 'Stripped Baseplate Threads / Impact Dents', sublabel: 'Chassis mounting defect', adj: -5000 },
      ],
    },
    {
      id: 'vid-power-gear',
      categoryId: 'cat-video-camera',
      question: 'OEM High-Capacity Battery & AC Mains Adapter?',
      subtext: 'Check OEM broadcast battery and AC power supply unit.',
      active: true,
      options: [
        { id: 'opt-vpwr-1', label: 'Original High-Capacity Battery & AC Adapter', sublabel: 'Complete power setup', adj: 2000 },
        { id: 'opt-vpwr-2', label: 'Battery Only (No AC Adapter)', sublabel: 'Standard battery operation', adj: 0 },
        { id: 'opt-vpwr-3', label: 'Third-Party Battery / Missing AC Power', sublabel: 'Incomplete power kit', adj: -3000 },
      ],
    },
    {
      id: 'vid-box',
      categoryId: 'cat-video-camera',
      question: 'Original Flight Case / Broadcast Bag / Retail Box?',
      subtext: 'Pelican style case, soft production bag, or original retail box.',
      active: true,
      options: [
        { id: 'opt-vbox-1', label: 'Original Flight Case or Retail Packaging', sublabel: 'Complete protective packaging', adj: 1500 },
        { id: 'opt-vbox-2', label: 'Camera Body Only (Carefully Padded)', sublabel: 'Standard operational unit', adj: 0 },
      ],
    },
  ],

  // ── 8. GIMBALS & STABILIZERS ──
  'cat-gimbal': [
    {
      id: 'gim-motors',
      categoryId: 'cat-gimbal',
      question: '3-Axis Motors & Balance Auto-Tune Calibration?',
      subtext: 'Mount a camera and execute auto-tune to check pan, roll, and tilt motors.',
      active: true,
      options: [
        { id: 'opt-gmot-1', label: 'Auto-Tunes Smoothly (Silent & Rock Solid)', sublabel: 'Zero vibration or motor jitter', adj: 0 },
        { id: 'opt-gmot-2', label: 'Minor High-Frequency Buzz on Tilt Axis', sublabel: 'Slight motor strain or tuning lag', adj: -2000 },
        { id: 'opt-gmot-3', label: 'Motor Overload Error / Axis Limp', sublabel: 'Burnt motor driver board', adj: -7000 },
      ],
    },
    {
      id: 'gim-axis-locks',
      categoryId: 'cat-gimbal',
      question: 'Mechanical Axis Locks & Tension Knobs?',
      subtext: 'Check 3 physical axis slide locks and thumb tightening levers.',
      active: true,
      options: [
        { id: 'opt-glck-1', label: 'All 3 Axis Locks Firm & Levers Tighten Smoothly', sublabel: 'Secure locking for transport', adj: 0 },
        { id: 'opt-glck-2', label: 'One Loose Axis Lock Slider (Usable)', sublabel: 'Minor locking latch play', adj: -1000 },
        { id: 'opt-glck-3', label: 'Broken Axis Lock / Stripped Tension Knob', sublabel: 'Cannot balance camera securely', adj: -3000 },
      ],
    },
    {
      id: 'gim-controls',
      categoryId: 'cat-gimbal',
      question: 'Joystick, Touchscreen & Mode Trigger Button?',
      subtext: 'Test smooth joystick speed curve, front trigger lock, and touch menu.',
      active: true,
      options: [
        { id: 'opt-gctl-1', label: 'Responsive Touchscreen, Joystick & Front Trigger', sublabel: '100% fluid control response', adj: 500 },
        { id: 'opt-gctl-2', label: 'Slight Drift on Joystick Center', sublabel: 'Needs joystick calibration', adj: -1000 },
        { id: 'opt-gctl-3', label: 'Unresponsive Touchscreen / Broken Trigger', sublabel: 'Controller board replacement needed', adj: -4000 },
      ],
    },
    {
      id: 'gim-battery',
      categoryId: 'cat-gimbal',
      question: 'Battery Grip Health & USB-C Fast Charging?',
      subtext: 'Test battery handle charge retention for a full shoot.',
      active: true,
      options: [
        { id: 'opt-gbat-1', label: 'Holds 10+ Hours Charge & Fast Charges Rapidly', sublabel: 'Excellent battery longevity', adj: 1000 },
        { id: 'opt-gbat-2', label: 'Normal Battery Life (4-6 Hours)', sublabel: 'Standard usable condition', adj: 0 },
        { id: 'opt-gbat-3', label: 'Rapid Battery Drain (< 1 Hour) / Wont Charge', sublabel: 'Battery handle replacement needed', adj: -3500 },
      ],
    },
    {
      id: 'gim-plate',
      categoryId: 'cat-gimbal',
      question: 'Quick Release Camera Mounting Plate & Base?',
      subtext: 'Inspect Arca-Swiss / Manfrotto mounting plate and lens support bracket.',
      active: true,
      options: [
        { id: 'opt-gplt-1', label: 'Complete Quick Release Plate + Safety Stops', sublabel: 'Ready to mount any camera', adj: 500 },
        { id: 'opt-gplt-2', label: 'Normal Mounting Plate Surface Scratches', sublabel: 'Locks securely onto base', adj: 0 },
        { id: 'opt-gplt-3', label: 'Missing Quick Release Plate', sublabel: 'Plate replacement required', adj: -1500 },
      ],
    },
    {
      id: 'gim-connectivity',
      categoryId: 'cat-gimbal',
      question: 'Bluetooth App Connection & Automated Tracking?',
      subtext: 'Connect to DJI Ronin, Feiyu, or ZHIYUN app to test parameter sync.',
      active: true,
      options: [
        { id: 'opt-gcon-1', label: 'Instant App Bluetooth Pairing & Firmware Updated', sublabel: 'Smooth smartphone motion control', adj: 0 },
        { id: 'opt-gcon-2', label: 'Slow Bluetooth Discovery', sublabel: 'Takes a couple tries to connect', adj: -1000 },
        { id: 'opt-gcon-3', label: 'Bluetooth Chip Non-Functional', sublabel: 'Cannot configure via mobile app', adj: -3000 },
      ],
    },
    {
      id: 'gim-ports',
      categoryId: 'cat-gimbal',
      question: 'Focus Motor & Video Transmission Expansion Ports?',
      subtext: 'Check RSA/NATO ports and USB-C camera control interfaces.',
      active: true,
      options: [
        { id: 'opt-gprt-1', label: 'All NATO & Camera Control Ports 100% Functional', sublabel: 'Clean pins, powers accessories', adj: 500 },
        { id: 'opt-gprt-2', label: 'Minor Scuffs Around NATO Rails', sublabel: 'Standard accessory mounting wear', adj: 0 },
        { id: 'opt-gprt-3', label: 'Camera Control Port Dead (No Shutter Trigger)', sublabel: 'Cannot trigger camera from handle', adj: -2500 },
      ],
    },
    {
      id: 'gim-finish',
      categoryId: 'cat-gimbal',
      question: 'Carbon Fiber / Aluminum Arm Finish & Dents?',
      subtext: 'Inspect axis arms for structural impact dents or cracks.',
      active: true,
      options: [
        { id: 'opt-gbod-1', label: 'Mint / Like-New Carbon Fiber & Aluminum Finish', sublabel: 'Zero impact marks', adj: 1000 },
        { id: 'opt-gbod-2', label: 'Minor Scuffs from Storage / Balancing', sublabel: 'Cosmetic only', adj: 0 },
        { id: 'opt-gbod-3', label: 'Deep Dents from Drop / Arm Misalignment', sublabel: 'Structural arm deformity', adj: -4000 },
      ],
    },
    {
      id: 'gim-tripod-handle',
      categoryId: 'cat-gimbal',
      question: 'Original Folding Tripod Feet & Briefcase Handle?',
      subtext: 'Original metal extended grip tripod legs and sling briefcase handle.',
      active: true,
      options: [
        { id: 'opt-gtrp-1', label: 'Original Metal Tripod + Briefcase Handle', sublabel: 'Complete handling kit', adj: 1000 },
        { id: 'opt-gtrp-2', label: 'Tripod Grip Only (No Briefcase Handle)', sublabel: 'Standard upright stand only', adj: 0 },
        { id: 'opt-gtrp-3', label: 'Missing Tripod Grip & Handle', sublabel: 'Incomplete handling accessories', adj: -1500 },
      ],
    },
    {
      id: 'gim-box',
      categoryId: 'cat-gimbal',
      question: 'Original Molded Foam Carrying Case & Cables?',
      subtext: 'Original high-density foam case and camera multi-control cables.',
      active: true,
      options: [
        { id: 'opt-gbx-1', label: 'Original Molded Hard Case + Control Cable Pack', sublabel: 'Complete factory case bundle', adj: 1000 },
        { id: 'opt-gbx-2', label: 'Gimbal Only (No Carrying Case)', sublabel: 'Gimbal hardware without outer packaging', adj: 0 },
      ],
    },
  ],
};

// In-memory runtime cache for questions
let inMemoryQuestions: CategoryQuestion[] = Object.values(defaultCategoryQuestions).flat();

async function getOrSeedQuestions(forceReset = false): Promise<CategoryQuestion[]> {
  const allDefaults = Object.values(defaultCategoryQuestions).flat();
  try {
    const col = await getCollection<CategoryQuestion>('diagnostic_questions');
    let items = await col.find({}).toArray();

    // If empty or force reset or missing any of the 8 categories (< 70 questions), seed all defaults
    if (forceReset || !items || items.length < 70) {
      if (forceReset) {
        await col.deleteMany({});
      }
      for (const q of allDefaults) {
        await col.updateOne({ id: q.id }, { $set: q }, { upsert: true });
      }
      items = await col.find({}).toArray();
    }

    const sanitized = items.map(({ _id, ...rest }: any) => ({
      ...rest,
      active: rest.active !== false,
    }));
    inMemoryQuestions = sanitized;
    return sanitized;
  } catch (err: any) {
    console.warn('MongoDB questions query fallback:', err?.message);
    if (forceReset || inMemoryQuestions.length < 70) {
      inMemoryQuestions = allDefaults;
    }
    return inMemoryQuestions;
  }
}

function normalizeCategoryId(raw?: string | null): string {
  if (!raw) return 'cat-dslr';
  const c = raw.toLowerCase().trim();
  if (
    c === 'cat-dslr' ||
    c === 'cat-lens' ||
    c === 'cat-smartphone' ||
    c === 'cat-laptop' ||
    c === 'cat-tablet' ||
    c === 'cat-action-camera' ||
    c === 'cat-video-camera' ||
    c === 'cat-gimbal'
  ) {
    return c;
  }
  if (c.includes('smart') || c.includes('phone') || c.includes('mobile')) return 'cat-smartphone';
  if (c.includes('laptop') || c.includes('macbook') || c.includes('notebook')) return 'cat-laptop';
  if (c.includes('lens') || c.includes('optics')) return 'cat-lens';
  if (c.includes('tablet') || c.includes('ipad') || c.includes('tab')) return 'cat-tablet';
  if (c.includes('action') || c.includes('gopro') || c.includes('osmo') || c.includes('insta360')) return 'cat-action-camera';
  if (c.includes('video') || c.includes('camcorder') || c.includes('cinema')) return 'cat-video-camera';
  if (c.includes('gimbal') || c.includes('stabilizer') || c.includes('ronin')) return 'cat-gimbal';
  if (c.includes('dslr') || c.includes('mirrorless') || c.includes('camera')) return 'cat-dslr';
  return 'cat-dslr';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || searchParams.get('category');
    const reset = searchParams.get('reset') === 'true';

    const all = await getOrSeedQuestions(reset);

    if (!categoryId || categoryId === 'all') {
      return NextResponse.json({
        success: true,
        questions: all,
        total: all.length,
        timestamp: new Date().toISOString(),
      });
    }

    const targetCat = normalizeCategoryId(categoryId);

    // Match either exact passed categoryId or normalized category ID
    let filtered = all.filter((q) => (q.categoryId === categoryId || q.categoryId === targetCat) && q.active !== false);

    // If no active questions found, fallback to targetCat defaults
    if (filtered.length === 0) {
      filtered = all.filter((q) => q.categoryId === targetCat);
    }

    return NextResponse.json({
      success: true,
      categoryId,
      normalizedCategoryId: targetCat,
      questions: filtered,
      total: filtered.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch diagnostic questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, question, subtext, options } = body;

    if (!categoryId || !question) {
      return NextResponse.json(
        { success: false, message: 'categoryId and question are required' },
        { status: 400 }
      );
    }

    const newQuestion: CategoryQuestion = {
      id: body.id || `q-${Date.now()}`,
      categoryId,
      question,
      subtext: subtext || '',
      active: body.active !== false,
      options: Array.isArray(options) ? options : [],
    };

    try {
      const col = await getCollection<CategoryQuestion>('diagnostic_questions');
      await col.insertOne(newQuestion as any);
    } catch (e) {
      console.warn('Mongo insert failed, saved to in-memory:', e);
    }

    inMemoryQuestions.push(newQuestion);

    return NextResponse.json({
      success: true,
      question: newQuestion,
      message: 'Question created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create question' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, categoryId, question, subtext, active, options } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Question id is required' }, { status: 400 });
    }

    const updateFields: Partial<CategoryQuestion> = {};
    if (question !== undefined) updateFields.question = question;
    if (subtext !== undefined) updateFields.subtext = subtext;
    if (active !== undefined) updateFields.active = active;
    if (options !== undefined) updateFields.options = options;
    if (categoryId !== undefined) updateFields.categoryId = categoryId;

    try {
      const col = await getCollection<CategoryQuestion>('diagnostic_questions');
      await col.updateOne({ id }, { $set: updateFields });
    } catch (e) {
      console.warn('Mongo update failed, updated in-memory:', e);
    }

    const idx = inMemoryQuestions.findIndex((q) => q.id === id);
    if (idx !== -1) {
      inMemoryQuestions[idx] = { ...inMemoryQuestions[idx], ...updateFields };
    }

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully',
      question: idx !== -1 ? inMemoryQuestions[idx] : { id, ...updateFields },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Question id is required' }, { status: 400 });
    }

    try {
      const col = await getCollection<CategoryQuestion>('diagnostic_questions');
      await col.deleteOne({ id });
    } catch (e) {
      console.warn('Mongo delete failed, removed from in-memory:', e);
    }

    inMemoryQuestions = inMemoryQuestions.filter((q) => q.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete question' },
      { status: 500 }
    );
  }
}
