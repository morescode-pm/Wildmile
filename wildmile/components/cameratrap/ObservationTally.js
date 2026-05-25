"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  Button,
  NumberInput,
  Group,
  Stack,
  Checkbox,
  TextInput,
  ActionIcon,
  ScrollArea,
  Flex,
  Paper,
} from "@mantine/core";
import {
  IconSend,
  IconX,
} from "@tabler/icons-react";
import {
  useImage,
  useSelection,
  useRecentSpecies,
  useUserLabeledSpecies,
  useAnimalCounts,
  useObservationState
} from "./ContextCamera";
import checkboxClasses from "styles/checkbox.module.css";
import styles from "styles/animalSelection.module.css";

export function ObservationTally({ fetchNextImage }) {
  const [currentImage] = useImage();
  const [selection, setSelection] = useSelection();
  const [recentSpecies, setRecentSpecies] = useRecentSpecies();
  const [userLabeledSpecies, setUserLabeledSpecies] = useUserLabeledSpecies();
  const [animalCounts, setAnimalCounts] = useAnimalCounts();
  const [obsState, setObsState] = useObservationState();
  const [isSaving, setIsSaving] = useState(false);
  const [comments, setComments] = useState([]);

  const { humanPresent, vehiclePresent, noAnimalsVisible, comment } = obsState;

  useEffect(() => {
    if (currentImage) {
      setComments(currentImage.mediaComments || []);
      // Clear comment for new image, but keep animal selection and other toggles
      setObsState((prev) => ({
        ...prev,
        comment: "",
      }));
    }
  }, [currentImage, setObsState]);

  const handleCountChange = (id, value) => {
    setAnimalCounts((prev) => ({ ...prev, [id]: value }));
  };

  const loadUserLabeled = useCallback(async () => {
    try {
      const res = await fetch("/api/cameratrap/user-labeled-species");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUserLabeledSpecies(data);
    } catch (error) {
      console.error("Error fetching user labeled species:", error);
    }
  }, [setUserLabeledSpecies]);

  const handleSaveObservations = useCallback(async ({ forceNoAnimals = false } = {}) => {
    if (!currentImage) return;

    setIsSaving(true);

    // Add comment if exists
    if (comment.trim()) {
      try {
        const response = await fetch("/api/cameratrap/addComment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId: currentImage.mediaID, comment }),
        });
        if (response.ok) {
          const newComment = await response.json();
          setComments(prev => [...prev, newComment]);
          setObsState(prev => ({ ...prev, comment: "" }));
        }
      } catch (e) {
        console.error("Error adding comment", e);
      }
    }

    let observations = [];

    if (
      (forceNoAnimals || noAnimalsVisible) &&
      !humanPresent &&
      !vehiclePresent
    ) {
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
    } else {
      if (selection.length > 0) {
        observations = selection.map((animal) => {
          const animalId = animal.taxonId || animal.id;
          return {
            mediaId: currentImage.mediaID,
            mediaInfo: {
              md5: currentImage.mediaID,
              imageHash: currentImage.imageHash,
            },
            taxonId: animalId,
            scientificName: animal.name,
            commonName: animal.preferred_common_name || animal.name,
            count: animalCounts[animalId] || 1,
            eventStart: currentImage.timestamp,
            eventEnd: currentImage.timestamp,
            observationLevel: "media",
            observationType: "animal",
          };
        });
      }

      if (humanPresent) {
        observations.push({
          mediaId: currentImage.mediaID,
          mediaInfo: {
            md5: currentImage.mediaID,
            imageHash: currentImage.imageHash,
          },
          eventStart: currentImage.timestamp,
          eventEnd: currentImage.timestamp,
          observationLevel: "media",
          observationType: "human",
        });
      }

      if (vehiclePresent) {
        observations.push({
          mediaId: currentImage.mediaID,
          mediaInfo: {
            md5: currentImage.mediaID,
            imageHash: currentImage.imageHash,
          },
          eventStart: currentImage.timestamp,
          eventEnd: currentImage.timestamp,
          observationLevel: "media",
          observationType: "vehicle",
        });
      }
    }

    try {
      const response = await fetch("/api/cameratrap/saveObservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(observations),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.savedSpecies?.length) {
          setRecentSpecies((prev) => {
            const existingNames = new Set(
              prev.map((s) => s.name?.toLowerCase())
            );
            const newEntries = selection
              .filter(
                (s) =>
                  data.savedSpecies.includes(s.name) &&
                  !existingNames.has(s.name?.toLowerCase())
              )
              .map((s) => ({
                ...s,
                name: s.name,
                preferred_common_name: s.preferred_common_name,
              }));
            if (!newEntries.length) return prev;
            return [...newEntries, ...prev].slice(0, 6);
          });
        }
        await loadUserLabeled();
        fetchNextImage();
      } else {
        alert("Failed to save observations.");
      }
    } catch (error) {
      console.error("Error saving observations:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    currentImage,
    comment,
    noAnimalsVisible,
    humanPresent,
    vehiclePresent,
    selection,
    animalCounts,
    fetchNextImage,
    setObsState,
    setRecentSpecies,
    loadUserLabeled,
  ]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const response = await fetch("/api/cameratrap/addComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage.mediaID, comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setObsState(prev => ({ ...prev, comment: "" }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleRemoveAnimal = (idToRemove) => {
    setSelection((prev) =>
      prev.filter((animal) => (animal.taxonId || animal.id) !== idToRemove)
    );
    setAnimalCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[idToRemove];
      return newCounts;
    });
  };

  if (!currentImage) return null;

  return (
    <Paper shadow="xs" p="md" withBorder radius="md" h="100%">
      <Stack gap="md" h="100%">
        <Text fw={700}>Observations</Text>

        {!noAnimalsVisible && (
          <ScrollArea h={350} offsetScrollbars scrollbarSize={4}>
            <Flex direction="column" gap="xs">
              {selection.map((animal) => {
                const animalId = animal.taxonId || animal.id;
                return (
                  <div key={animalId} className={styles.selectionContainer}>
                    <div className={styles.selectionContent}>
                      <Text className={styles.speciesName}>
                        {animal.preferred_common_name || animal.name}
                      </Text>
                      <div className={styles.controls}>
                        <NumberInput
                          value={animalCounts[animalId] || 1}
                          onChange={(value) =>
                            handleCountChange(animalId, value)
                          }
                          min={1}
                          max={100}
                          style={{ width: 80 }}
                        />
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleRemoveAnimal(animalId)}
                          className={styles.removeButton}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Flex>
          </ScrollArea>
        )}

        <Group grow wrap="nowrap">
          <Checkbox
            classNames={checkboxClasses}
            label="Human"
            checked={humanPresent}
            readOnly
            wrapperProps={{
              onClick: () =>
                setObsState((prev) => ({
                  ...prev,
                  humanPresent: !prev.humanPresent,
                })),
            }}
          />
          <Checkbox
            classNames={checkboxClasses}
            label="Vehicle"
            checked={vehiclePresent}
            readOnly
            wrapperProps={{
              onClick: () =>
                setObsState((prev) => ({
                  ...prev,
                  vehiclePresent: !prev.vehiclePresent,
                })),
            }}
          />
        </Group>

        {noAnimalsVisible || selection.length > 0 || humanPresent || vehiclePresent ? (
          <Button
            color="blue"
            fullWidth
            onClick={() => handleSaveObservations()}
            loading={isSaving}
          >
            {isSaving ? "Saving..." : "Save Observations"}
          </Button>
        ) : (
          <Button
            color="blue"
            variant="outline"
            fullWidth
            onClick={() => handleSaveObservations({ forceNoAnimals: true })}
            loading={isSaving}
          >
            No Animals Visible
          </Button>
        )}

        <Stack gap="xs" style={{ flex: 1 }}>
          <Group mt="xs">
            <TextInput
              placeholder="Add a comment..."
              value={comment}
              onChange={(event) => setObsState(prev => ({ ...prev, comment: event.currentTarget.value }))}
              style={{ flex: 1 }}
            />
            <ActionIcon onClick={handleAddComment} disabled={!comment.trim()}>
              <IconSend size={24} />
            </ActionIcon>
          </Group>
          <ScrollArea h={200} offsetScrollbars>
            <Stack gap="xs">
              {comments.map((comment, index) => (
                <Text key={index} size="sm">
                  <strong>{comment.author.name}:</strong> {comment.text}
                </Text>
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
      </Stack>
    </Paper>
  );
}
