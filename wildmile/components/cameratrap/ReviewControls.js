"use client";

import React, { useState, useEffect } from "react";
import {
  Paper,
  Text,
  Group,
  Button,
  Stack,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  useImage,
  useReviewMode,
  useRelabeling,
  useSelection,
  useAnimalCounts,
  useObservationState,
} from "./ContextCamera";
import { motion, useAnimation } from "framer-motion";

export const ReviewControls = ({ fetchNextImage }) => {
  const [currentImage] = useImage();
  const [reviewMode] = useReviewMode();
  const [isRelabeling, setRelabeling] = useRelabeling();
  const [, setSelection] = useSelection();
  const [, setAnimalCounts] = useAnimalCounts();
  const [, setObsState] = useObservationState();
  const [isSaving, setIsSaving] = useState(false);

  const controls = useAnimation();

  useEffect(() => {
    if (currentImage) {
      controls.set({ x: 0, opacity: 1 });
    }
  }, [currentImage, controls]);

  if (!reviewMode || !currentImage || isRelabeling) return null;

  const consensusItems = currentImage.speciesConsensus || [];

  const summaryParts = consensusItems.map((item) => {
    if (item.observationType === "animal") {
      const commonName = item.preferredCommonName || item.scientificName;
      const scientificName = item.preferredCommonName ? item.scientificName : null;
      return (
        <Stack gap={0} align="center" key={item.scientificName}>
          <Text fw={800} size="xl" c="blue">{item.count}x {commonName}</Text>
          {scientificName && (
            <Text size="xs" c="dimmed" fs="italic">{scientificName}</Text>
          )}
        </Stack>
      );
    }
    if (item.observationType === "human") return <Text fw={800} size="xl" c="blue" key="human">Human</Text>;
    if (item.observationType === "vehicle") return <Text fw={800} size="xl" c="blue" key="vehicle">Vehicle</Text>;
    return null;
  }).filter(Boolean);

  const handleConfirm = async () => {
    setIsSaving(true);
    const observations = consensusItems.map((item) => ({
      mediaId: currentImage.mediaID,
      mediaInfo: {
        md5: currentImage.mediaID,
        imageHash: currentImage.imageHash,
      },
      taxonId: item.taxonID,
      scientificName: item.scientificName,
      count: item.count,
      eventStart: currentImage.timestamp,
      eventEnd: currentImage.timestamp,
      observationLevel: "media",
      observationType: item.observationType,
    }));

    // If blank
    if (observations.length === 0) {
      observations.push({
        mediaId: currentImage.mediaID,
        mediaInfo: {
          md5: currentImage.mediaID,
          imageHash: currentImage.imageHash,
        },
        eventStart: currentImage.timestamp,
        eventEnd: currentImage.timestamp,
        observationLevel: "media",
        observationType: "blank",
      });
    }

    try {
      const response = await fetch("/api/cameratrap/saveObservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(observations),
      });

      if (response.ok) {
        await controls.start({ x: 500, opacity: 0 });
        setSelection([]);
        setAnimalCounts({});
        fetchNextImage();
        controls.set({ x: 0, opacity: 1 });
      } else {
        alert("Failed to confirm observations.");
      }
    } catch (error) {
      console.error("Error confirming observations:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRelabel = () => {
    // Pre-fill selection and counts for relabeling
    const initialSelection = consensusItems
      .filter(i => i.observationType === 'animal')
      .map(i => ({
        taxonId: i.taxonID,
        name: i.scientificName,
        // preferred_common_name: i.scientificName, // We might not have it here
      }));

    const initialCounts = {};
    consensusItems.filter(i => i.observationType === 'animal').forEach(i => {
      initialCounts[i.taxonID] = i.count;
    });

    setSelection(initialSelection);
    setAnimalCounts(initialCounts);
    setObsState({
      humanPresent: consensusItems.some(i => i.observationType === 'human'),
      vehiclePresent: consensusItems.some(i => i.observationType === 'vehicle'),
      noAnimalsVisible: consensusItems.length === 0,
      comment: "",
    });

    setRelabeling(true);
    controls.start({ x: -500, opacity: 0 }).then(() => {
        // Mode switch happens, component might unmount or change
    });
  };

  const onDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      handleConfirm();
    } else if (info.offset.x < -100) {
      handleRelabel();
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: "83%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      width: "100%",
      maxWidth: 350,
      padding: "0 10px"
    }}>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={onDragEnd}
        animate={controls}
        style={{ width: "100%" }}
      >
        <Paper shadow="xl" p="md" withBorder radius="xl" style={{ backgroundColor: "var(--mantine-color-body)" }}>
          <Stack gap="xs" align="center">
            <Text size="md" fw={700} ta="center">
              Does this photo have:
            </Text>
            <Stack gap={4} align="center">
              {summaryParts.length > 0 ? summaryParts : <Text fw={800} size="xl" c="blue">No animals/humans/vehicles</Text>}
            </Stack>
            <Group justify="space-between" mt="md" style={{ width: "100%" }}>
              <Tooltip label="Swipe Left to Re-label">
                <Button
                  variant="light"
                  color="red"
                  radius="xl"
                  size="lg"
                  leftSection={<IconX size={24} />}
                  onClick={handleRelabel}
                >
                  Re-label
                </Button>
              </Tooltip>

              <Tooltip label="Swipe Right to Confirm">
                <Button
                  variant="filled"
                  color="green"
                  radius="xl"
                  size="lg"
                  rightSection={<IconCheck size={24} />}
                  onClick={handleConfirm}
                  loading={isSaving}
                >
                  Confirm
                </Button>
              </Tooltip>
            </Group>
          </Stack>
        </Paper>
      </motion.div>
    </div>
  );
};
