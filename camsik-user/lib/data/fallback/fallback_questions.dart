class FallbackQuestions {
  // Static data commented out as requested. Real data is loaded dynamically via API.
  /*
  static List<Map<String, dynamic>> _getStaticQuestions(String categoryId) {
    if (categoryId == 'cat-smartphone' || categoryId == 'cat-tablet') {
      return [
        {
          'id': 'phone-screen',
          'question': 'Display & Touchscreen Status?',
          'options': [
            {'label': 'Original Flawless Screen', 'sublabel': 'Zero scratches, perfect TrueTone/120Hz', 'adj': 2000},
            {'label': 'Minor Hairline Scratches', 'sublabel': 'Touch & display 100% functional', 'adj': 0},
            {'label': 'Cracked Glass / Black Dots', 'sublabel': 'Display bleeding or lines', 'adj': -6000},
          ],
        },
        {
          'id': 'phone-body',
          'question': 'Back Glass & Metal Frame?',
          'options': [
            {'label': 'Mint / Pristine Condition', 'sublabel': 'Always used in case', 'adj': 1000},
            {'label': 'Minor Edge Dents / Scratches', 'sublabel': 'Standard daily wear', 'adj': 0},
            {'label': 'Cracked Back Glass / Bent', 'sublabel': 'Chassis damage', 'adj': -3500},
          ],
        },
        {
          'id': 'phone-battery',
          'question': 'Battery Health Percentage?',
          'options': [
            {'label': '90% - 100% Health', 'sublabel': 'Excellent battery longevity', 'adj': 1500},
            {'label': '80% - 89% Health', 'sublabel': 'Standard operational health', 'adj': 0},
            {'label': 'Below 80% / Service Alert', 'sublabel': 'Requires battery replacement', 'adj': -3000},
          ],
        },
        {
          'id': 'phone-hardware',
          'question': 'Cameras, FaceID & Microphones?',
          'options': [
            {'label': 'All Cameras & Sensors Perfect', 'sublabel': '0.5x, 1x, 3x, FaceID 100%', 'adj': 0},
            {'label': 'FaceID / Fingerprint Failure', 'sublabel': 'Biometric sensor unavailable', 'adj': -3000},
            {'label': 'Camera Shaking / Foggy Lens', 'sublabel': 'OIS motor or lens flaw', 'adj': -4500},
          ],
        },
      ];
    } else if (categoryId == 'cat-laptop') {
      return [
        {
          'id': 'lap-display',
          'question': 'Screen & Retina Coating?',
          'options': [
            {'label': 'Pristine Flawless Display', 'sublabel': 'No dead pixels or delamination', 'adj': 1500},
            {'label': 'Keyboard Imprints / Micro Scratches', 'sublabel': 'Visible only under direct light', 'adj': 0},
            {'label': 'Cracked Panel / Lines / Stain', 'sublabel': 'Screen replacement needed', 'adj': -7000},
          ],
        },
        {
          'id': 'lap-keyboard',
          'question': 'Keyboard & Trackpad Condition?',
          'options': [
            {'label': 'All Keys & Touchpad Perfect', 'sublabel': 'Smooth typing & gestures', 'adj': 0},
            {'label': 'Sticky / Stiff Keys', 'sublabel': 'Minor key resistance', 'adj': -2500},
            {'label': 'Trackpad Click Defect', 'sublabel': 'Click or haptic unresponsive', 'adj': -4000},
          ],
        },
        {
          'id': 'lap-battery',
          'question': 'Battery Health & Charger?',
          'options': [
            {'label': 'Original Charger + High Health', 'sublabel': 'Holds charge 6+ hours', 'adj': 2000},
            {'label': 'Normal Battery Health', 'sublabel': 'Holds charge 3-5 hours', 'adj': 0},
            {'label': 'Service Battery Warning', 'sublabel': 'Requires replacement', 'adj': -4000},
          ],
        },
        {
          'id': 'lap-body',
          'question': 'Aluminum Body & Hinges?',
          'options': [
            {'label': 'Mint / Solid Hinges', 'sublabel': 'Smooth opening & closing', 'adj': 1500},
            {'label': 'Minor Edge Scuffs', 'sublabel': 'Cosmetic edge rub', 'adj': 0},
            {'label': 'Heavy Dent / Loose Hinge', 'sublabel': 'Chassis deformity', 'adj': -4500},
          ],
        },
      ];
    } else if (categoryId == 'cat-lens') {
      return [
        {
          'id': 'lens-glass',
          'question': 'Optical Glass & Coating Condition?',
          'options': [
            {'label': 'Crystal Clear (No Fungus/Scratches)', 'sublabel': 'Flawless optical glass', 'adj': 2000},
            {'label': 'Minor Dust Specks (No Effect on Image)', 'sublabel': 'Normal internal micro-dust', 'adj': 0},
            {'label': 'Visible Fungus / Deep Scratch', 'sublabel': 'Internal coating haze or fungus', 'adj': -5500},
          ],
        },
        {
          'id': 'lens-motor',
          'question': 'Autofocus & Aperture Blades?',
          'options': [
            {'label': 'Fast Silent AF & Snappy Aperture', 'sublabel': '100% operational', 'adj': 0},
            {'label': 'Sluggish AF / Stiff Focus Ring', 'sublabel': 'Slow motor response', 'adj': -2500},
            {'label': 'AF Hunting Failure / Oily Blades', 'sublabel': 'Aperture stickiness', 'adj': -4500},
          ],
        },
        {
          'id': 'lens-accessories',
          'question': 'Included Lens Accessories?',
          'options': [
            {'label': 'Full Box + Hood + Front & Rear Caps', 'sublabel': 'Complete original bundle', 'adj': 1500},
            {'label': 'Front & Rear Caps Only', 'sublabel': 'Basic essential protection', 'adj': 0},
            {'label': 'Missing Lens Caps', 'sublabel': 'No caps included', 'adj': -1000},
          ],
        },
      ];
    } else {
      return [
        {
          'id': 'cam-power',
          'question': 'Does the camera power on & shoot normally?',
          'options': [
            {'label': 'Powers on & Shoots Perfectly', 'sublabel': 'Normal shutter response & dials', 'adj': 0},
            {'label': 'Intermittent Shutter Lag', 'sublabel': 'Takes photos but occasional pause', 'adj': -3000},
            {'label': 'Does Not Power On', 'sublabel': 'Requires servicing / board check', 'adj': -8000},
          ],
        },
        {
          'id': 'cam-sensor',
          'question': 'Sensor Glass & Viewfinder Condition?',
          'options': [
            {'label': 'Pristine Flawless Sensor', 'sublabel': 'Zero spots, dust or scratches', 'adj': 2000},
            {'label': 'Minor Dust (Easily Cleaned)', 'sublabel': 'Standard sensor dust specks', 'adj': 0},
            {'label': 'Visible Scratches / Fungus', 'sublabel': 'Coating damage or fungus mark', 'adj': -5000},
          ],
        },
        {
          'id': 'cam-body',
          'question': 'Body Cosmetic & Rubber Grip Condition?',
          'options': [
            {'label': 'Like New / Flawless', 'sublabel': 'No scratches, firm rubber grips', 'adj': 1500},
            {'label': 'Good (Minor Rub Marks)', 'sublabel': 'Normal cosmetic edge wear', 'adj': 0},
            {'label': 'Heavy Paint Wear / Peeling', 'sublabel': 'Loose rubber or body dings', 'adj': -3500},
          ],
        },
        {
          'id': 'cam-accessories',
          'question': 'Original Accessories Included?',
          'options': [
            {'label': 'Full Box + Charger + 2 Batteries', 'sublabel': 'Complete packaging & caps', 'adj': 2500},
            {'label': 'Original Charger + 1 Battery', 'sublabel': 'Basic working bundle', 'adj': 0},
            {'label': 'Third-Party Charger Only', 'sublabel': 'No original box/charger', 'adj': -2000},
          ],
        },
        {
          'id': 'cam-shutter',
          'question': 'Estimated Shutter Actuations?',
          'options': [
            {'label': '< 20,000 Shutter Count', 'sublabel': 'Light hobbyist usage', 'adj': 1500},
            {'label': '20,000 - 60,000 Shutter Count', 'sublabel': 'Moderate regular use', 'adj': 0},
            {'label': '> 80,000 Shutter Count', 'sublabel': 'Heavy professional workload', 'adj': -4000},
          ],
        },
      ];
    }
  }
  */

  static List<Map<String, dynamic>> getQuestions(String categoryId) {
    return const [];
  }
}
