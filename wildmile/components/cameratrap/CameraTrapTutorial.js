import React, { useEffect, useState } from 'react';
import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useSelection, useAnimalCounts, useTutorial } from './ContextCamera';

export const CameraTrapTutorial = () => {
  const [selection, setSelection] = useSelection();
  const [animalCounts, setAnimalCounts] = useAnimalCounts();
  const [run, setRun] = useTutorial();
  const [tourKey, setTourKey] = useState(0);

  // Increment key whenever run becomes true to reset Joyride state and allow multiple restarts
  useEffect(() => {
    if (run) {
      setTourKey(prev => prev + 1);
    }
  }, [run]);

  const exampleSquirrel = {
    id: 'example-squirrel',
    taxonId: 'example-squirrel',
    name: 'Sciurus carolinensis',
    preferred_common_name: 'Eastern Gray Squirrel',
  };

  const exampleRaccoon = {
    id: 'example-raccoon',
    taxonId: 'example-raccoon',
    name: 'Procyon lotor',
    preferred_common_name: 'Northern Raccoon',
  };

  const steps = [
    {
      target: '#main-navigation-bar',
      content: '1. Use these controls to navigate images. You can go to the next/previous photo with the arrows, jump to the earliest image, or click "Get Images" to refresh. You can also adjust your filters here.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#image-annotation-card',
      content: '2. You can zoom in and out of the image using your mouse wheel or pinch gestures to see details more clearly.',
      placement: 'right',
    },
    {
      target: '#image-action-buttons',
      content: '3. Use these buttons to interact with the image: copy a share link, view AI detections, play a video, request ID help, report issues, or favorite the image.',
      placement: 'top',
    },
    {
      target: '#save-observations-button',
      content: '4. If no animals are visible, click "No Animals Visible". Also, check the Human or Vehicle boxes if they are present in the photo.',
      placement: 'left',
    },
    {
      target: '#wildlife-search-container',
      content: '5. If animals are present, select them from the available species in this sidebar.',
      placement: 'left',
    },
    {
      target: '#species-tabs',
      content: '6. Use the clock icon for "Recently Used" species and the user icon for "My Animals". You can also search for a specific animal. If you need help, post to our WhatsApp channel!',
      placement: 'left',
    },
    {
      target: '#observation-tally-container',
      content: '7. Once you select an animal, it will appear here. Use the plus and minus buttons to indicate the count.',
      placement: 'left',
    },
    {
      target: '#observation-tally-container',
      content: '8. If there are multiple types of animals, pick each one and set their counts accordingly.',
      placement: 'left',
    },
    {
      target: '#save-observations-button',
      content: '9. Finally, click "Save Observations". Your selections are kept between images to help with bursts, so remember to remove any animals that aren\'t in the next photo!',
      placement: 'top',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      // Clean up example animals
      setSelection(prev => prev.filter(a => !['example-squirrel', 'example-raccoon'].includes(a.id)));
    }

    // Step 7 logic (index 6): Show one example animal
    if (type === EVENTS.STEP_BEFORE && index === 6) {
      setSelection(prev => {
        const base = prev.filter(a => !['example-squirrel', 'example-raccoon'].includes(a.id));
        return [...base, exampleSquirrel];
      });
      setAnimalCounts(prev => ({ ...prev, 'example-squirrel': 2 }));
    }

    // Step 8 logic (index 7): Show two example animals
    if (type === EVENTS.STEP_BEFORE && index === 7) {
      setSelection(prev => {
        const base = prev.filter(a => !['example-squirrel', 'example-raccoon'].includes(a.id));
        return [...base, exampleSquirrel, exampleRaccoon];
      });
      setAnimalCounts(prev => ({ ...prev, 'example-squirrel': 2, 'example-raccoon': 1 }));
    }
  };

  return (
    <Joyride
      key={tourKey}
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollOffset={100}
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#40c057', // Green
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        tooltip: {
          fontSize: '16px',
        },
        buttonPrimary: {
          backgroundColor: '#40c057',
          color: '#ffffff',
        },
        beaconInner: {
          backgroundColor: '#40c057',
        },
        beaconOuter: {
          border: '2px solid #40c057',
        },
        spotlight: {
          // Keep empty
        }
      }}
    />
  );
};
