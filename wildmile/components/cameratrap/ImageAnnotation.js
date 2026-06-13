"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Modal,
  Indicator,
  Tooltip,
  Box,
} from "@mantine/core";
import {
  IconHeartPlus,
  IconHeart,
  IconHeartFilled,
  IconMaximize,
  IconLink,
  IconPhotoSearch,
  IconMoodWrrr,
  IconFocus2,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useImage } from "./ContextCamera";
import { ObservationHistoryPopover } from "./ObservationHistory";
import { SpeciesConsensusBadges } from "./SpeciesConsensusBadges";

export function ImageAnnotation({ filters }) {
  const [currentImage, setCurrentImage] = useImage();
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [showAIBoxes, setShowAIBoxes] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (currentImage) {
      setIsFavorite(currentImage.favorite || false);
      setNeedsReview(currentImage.needsReview || false);
      setFlagged(currentImage.flagged || false);
    }
  }, [currentImage]);

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch("/api/cameratrap/toggleFavorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage.mediaID }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        alert("Failed to toggle favorite");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Error toggling favorite");
    }
  };

  const handleNeedsReview = async () => {
    try {
      const response = await fetch("/api/cameratrap/toggleNeedsReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage.mediaID }),
      });

      if (response.ok) {
        const data = await response.json();
        setNeedsReview(data.needsReview);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to toggle needs review");
      }
    } catch (error) {
      console.error("Error toggling needs review:", error);
      alert("Error toggling needs review");
    }
  };

  const handleFlagged = async () => {
    try {
      const response = await fetch("/api/cameratrap/toggleFlagged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage.mediaID }),
      });

      if (response.ok) {
        const data = await response.json();
        setFlagged(data.flagged);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to toggle flagged status");
      }
    } catch (error) {
      console.error("Error toggling flagged status:", error);
      alert("Error toggling flagged status");
    }
  };

  const toggleEnlargedImage = () => {
    setEnlargedImage(!enlargedImage);
  };

  if (!currentImage) {
    return <Text>No image selected</Text>;
  }

  return (
    <>
      <Box id="image-annotation-card" h="100%" p="xs">
        <Stack gap="xs" h="100%" style={{ overflow: "hidden" }}>
        <Box
          style={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            backgroundColor: "black",
            borderRadius: "var(--mantine-radius-md)",
            overflow: "hidden",
          }}
        >
          <TransformWrapper
            defaultScale={1}
            wheel={{ step: 0.4 }}
            pinch={{ step: 0.2 }}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  maxHeight: "100%",
                  maxWidth: "100%",
                }}
              >
                <img
                  src={currentImage.publicURL}
                  style={{
                    display: "block",
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  alt="Wildlife image"
                />
                {showAIBoxes &&
                  currentImage.aiResults?.[0]?.animalDetections?.map(
                    (detection, index) => {
                      const [xmin, ymin, width, height] = detection.bbox;
                      return (
                        <div
                          key={index}
                          style={{
                            position: "absolute",
                            left: `${xmin * 100}%`,
                            top: `${ymin * 100}%`,
                            width: `${width * 100}%`,
                            height: `${height * 100}%`,
                            border: "2px solid #00ff00",
                            pointerEvents: "none",
                            boxSizing: "border-box",
                            zIndex: 10,
                          }}
                        >
                          <Badge
                            variant="filled"
                            color="green"
                            size="xs"
                            style={{
                              position: "absolute",
                              top: -20,
                              left: 0,
                              pointerEvents: "none",
                            }}
                          >
                            {Math.round(detection.conf * 100)}%
                          </Badge>
                        </div>
                      );
                    }
                  )}
              </div>
            </TransformComponent>
          </TransformWrapper>
          <ActionIcon
            style={{ position: "absolute", top: 10, right: 10, zIndex: 20 }}
            onClick={toggleEnlargedImage}
          >
            <IconMaximize size={24} />
          </ActionIcon>
        </Box>

        <Stack gap={4} mt="xs">
          <Group justify="space-between">
            <Group gap={4} id="image-action-buttons">
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/cameratrap/identify/${currentImage.mediaID}`
                  );
                  alert("Image URL copied to clipboard");
                }}
              >
                <IconLink size={18} />
              </ActionIcon>
              <Tooltip label="Show AI Detections">
                <ActionIcon
                  size="sm"
                  onClick={() => setShowAIBoxes((prev) => !prev)}
                  variant={showAIBoxes ? "filled" : "outline"}
                  color="blue"
                  disabled={
                    !currentImage.aiResults ||
                    currentImage.aiResults.length === 0 ||
                    !currentImage.aiResults[0].animalDetections ||
                    currentImage.aiResults[0].animalDetections.length === 0
                  }
                >
                  <IconFocus2 size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Play Video">
                <ActionIcon
                  size="sm"
                  onClick={() => setShowVideo(true)}
                  variant="outline"
                  color="teal"
                  disabled={!currentImage?.videoUrl}
                >
                  <IconPlayerPlay size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Need Help with ID">
                <ActionIcon
                  size="sm"
                  onClick={handleNeedsReview}
                  variant={needsReview ? "filled" : "outline"}
                  color="yellow"
                >
                  <IconPhotoSearch size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Report Inappropriate">
                <ActionIcon
                  size="sm"
                  onClick={handleFlagged}
                  variant={flagged ? "filled" : "outline"}
                  color="red"
                >
                  <IconMoodWrrr size={18} />
                </ActionIcon>
              </Tooltip>
              <Indicator
                inline
                label={currentImage.favoriteCount}
                disabled={!currentImage.favoriteCount}
                size={14}
              >
                <ActionIcon
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite();
                  }}
                  color="red"
                  variant={isFavorite ? "filled" : "outline"}
                >
                  {isFavorite ? (
                    <IconHeartFilled size={18} />
                  ) : (
                    <IconHeartPlus size={18} />
                  )}
                </ActionIcon>
              </Indicator>
            </Group>
            <Group gap="xs">
              <Text size="8px" style={{ fontFamily: "monospace" }}>
                {new Date(currentImage.timestamp).toLocaleString("en-US", { timeZone: "UTC" })}
              </Text>
              <Text size="8px" style={{ fontFamily: "monospace" }}>
                {currentImage.mediaID}
              </Text>
            </Group>
          </Group>

          <Group gap="xs">
            <SpeciesConsensusBadges
              speciesConsensus={currentImage.speciesConsensus}
            />
            <ObservationHistoryPopover mediaID={currentImage.mediaID} />
          </Group>
        </Stack>
        </Stack>
      </Box>

      <Modal
        opened={enlargedImage}
        onClose={() => setEnlargedImage(false)}
        size="100%"
        padding={0}
        styles={{
          inner: { padding: 0 },
          modal: { maxWidth: "100%" },
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "black",
            minHeight: "100vh",
          }}
        >
          <TransformWrapper
            defaultScale={1}
            wheel={{ step: 0.4 }}
            pinch={{ step: 0.2 }}
          >
            <TransformComponent
              wrapperStyle={{ width: "100vw", height: "100vh" }}
              contentStyle={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  maxHeight: "100vh",
                  maxWidth: "100vw",
                }}
              >
                <img
                  src={currentImage.publicURL}
                  style={{
                    display: "block",
                    maxHeight: "100vh",
                    maxWidth: "100vw",
                    objectFit: "contain",
                  }}
                  alt="Enlarged wildlife image"
                />
                {showAIBoxes &&
                  currentImage.aiResults?.[0]?.animalDetections?.map(
                    (detection, index) => {
                      const [xmin, ymin, width, height] = detection.bbox;
                      return (
                        <div
                          key={index}
                          style={{
                            position: "absolute",
                            left: `${xmin * 100}%`,
                            top: `${ymin * 100}%`,
                            width: `${width * 100}%`,
                            height: `${height * 100}%`,
                            border: "2px solid #00ff00",
                            pointerEvents: "none",
                            boxSizing: "border-box",
                            zIndex: 10,
                          }}
                        >
                          <Badge
                            variant="filled"
                            color="green"
                            size="xs"
                            style={{
                              position: "absolute",
                              top: -20,
                              left: 0,
                              pointerEvents: "none",
                            }}
                          >
                            {Math.round(detection.conf * 100)}%
                          </Badge>
                        </div>
                      );
                    }
                  )}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </Modal>

      <Modal
        opened={showVideo}
        onClose={() => setShowVideo(false)}
        title="Attached Video"
        size="lg"
      >
        {currentImage?.videoUrl && (
          <video src={currentImage.videoUrl} controls autoPlay style={{ width: "100%", maxHeight: "80vh" }}>
            Your browser does not support the video tag.
          </video>
        )}
      </Modal>
    </>
  );
}
