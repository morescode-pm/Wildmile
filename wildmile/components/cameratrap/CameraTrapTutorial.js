import React from 'react';
import { Joyride } from 'react-joyride';

export const CameraTrapTutorial = ({ run, setRun }) => {
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
      content: '6. When you pick an animal, indicate how many are present using the plus and minus buttons.',
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

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollOffset={100}
      callback={(data) => {
        const { status } = data;
        if (['finished', 'skipped'].includes(status)) {
          setRun(false);
        }
      }}
      styles={{
        options: {
          primaryColor: '#228be6',
          zIndex: 10000,
        },
      }}
    />
  );
};
