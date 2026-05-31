import React, { useEffect } from 'react';
import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useSelection, useAnimalCounts } from './ContextCamera';

export const CameraTrapTutorial = ({ run, setRun }) => {
  const [selection, setSelection] = useSelection();
  const [animalCounts, setAnimalCounts] = useAnimalCounts();

  const exampleAnimal = {
    id: 'example-squirrel',
    taxonId: 'example-squirrel',
    name: 'Sciurus carolinensis',
    preferred_common_name: 'Eastern Gray Squirrel',
  };

  const steps = [
    {
      target: '#login-button',
      content: '1. Log in to your account to save your observations and track your progress.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#image-action-buttons',
      content: '2. Use the picture action buttons to copy a share link, view AI detection boxes, play associated video, request help with ID, flag inappropriate content, or favorite the image.',
      placement: 'top',
    },
    {
      target: '#save-observations-button',
      content: '3. If there are no animals visible, click the "No Animals Visible" button. Make sure to check the Human or Vehicle boxes if you see them in the photo.',
      placement: 'left',
    },
    {
      target: '#wildlife-search-container',
      content: '4. If there are animals - pick the animals from the species available in the sidebar.',
      placement: 'right',
    },
    {
      target: '#species-tabs',
      content: '5. The "Recently Used" list keeps track of what you\'ve labeled recently, and "My Animals" tracks everything you\'ve ever labeled. Use the search tool if you can\'t find the animal. Post to our WhatsApp channel if you need help with an ID!',
      placement: 'right',
    },
    {
      target: '#observation-tally-container',
      content: '6. When you pick an animal, it appears here. Indicate how many are present using the plus and minus buttons.',
      placement: 'left',
    },
    {
      target: '#observation-tally-container',
      content: '7. If there are more than one type of animal, pick all the types visible and set their counts.',
      placement: 'left',
    },
    {
      target: '#save-observations-button',
      content: '8. Save your observations. Note: the selections you made are kept between images to help with bursts. Make sure to remove the animal if it\'s not in the new picture!',
      placement: 'top',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      // Clean up example animal
      setSelection(prev => prev.filter(a => a.id !== 'example-squirrel'));
    }

    // Inject example animal when we reach the tally steps
    if (type === EVENTS.STEP_BEFORE && (index === 5 || index === 6)) {
      setSelection(prev => {
        if (!prev.find(a => a.id === 'example-squirrel')) {
          return [...prev, exampleAnimal];
        }
        return prev;
      });
      setAnimalCounts(prev => ({ ...prev, 'example-squirrel': 2 }));
    }
  };

  return (
    <Joyride
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
        },
        tooltip: {
          fontSize: '16px',
        },
        buttonNext: {
          backgroundColor: '#40c057',
        },
        beacon: {
          color: '#40c057',
        },
        spotlight: {
          backgroundColor: 'rgba(64, 192, 87, 0.2)',
        }
      }}
    />
  );
};
