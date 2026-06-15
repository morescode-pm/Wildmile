"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { useImage, useTutorial, useImageLoaded } from "./ContextCamera";
import { ObservationHistoryPopover } from "./ObservationHistory";
import { SpeciesConsensusBadges } from "./SpeciesConsensusBadges";

import { useElementSize } from "@mantine/hooks";

export function ImageAnnotation({ filters }) {
  const { ref: containerRef, width: containerWidth, height: containerHeight } = useElementSize();
  const [currentImage, setCurrentImage] = useImage();
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [showAIBoxes, setShowAIBoxes] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const imageSize = useMemo(() => {
    const width = currentImage?.naturalWidth || naturalSize.width;
    const height = currentImage?.naturalHeight || naturalSize.height;
    if (width > 0 && containerWidth > 0 && containerHeight > 0) {
      const ratio = Math.min(containerWidth / width, containerHeight / height);
      return {
        width: width * ratio,
        height: height * ratio,
      };
    }
    return { width: 0, height: 0 };
  }, [currentImage, naturalSize, containerWidth, containerHeight]);

  const [imageLoaded, setImageLoaded] = useImageLoaded();
  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
  };

  useEffect(() => {
    if (currentImage) {
      setIsFavorite(currentImage.favorite || false);
      setNeedsReview(currentImage.needsReview || false);
      setFlagged(currentImage.flagged || false);

      if (currentImage.naturalWidth) {
        setNaturalSize({
          width: currentImage.naturalWidth,
          height: currentImage.naturalHeight,
        });
        setImageLoaded(true);
      } else {
        // Fallback if not pre-loaded with dimensions
        setNaturalSize({ width: 0, height: 0 });
        setImageLoaded(false);
      }
    }
  }, [currentImage, setImageLoaded]);

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

  const [runTutorial] = useTutorial();

  if (!currentImage && !runTutorial) {
    return <Text>No image selected</Text>;
  }

  return (
    <>
      <Box id="image-annotation-card" h="100%" p={0}>
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
                ref={containerRef}
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: imageSize.width,
                    height: imageSize.height,
                  }}
                >
                  <img
                    src={currentImage?.publicURL}
                    onLoad={handleImageLoad}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    alt="Wildlife image"
                  />
                  {showAIBoxes && imageLoaded && imageSize.width > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                      }}
                    >
                      {currentImage?.aiResults?.[0]?.animalDetections?.map(
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
                  )}
                </div>
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

        <Stack gap="xs" mt="xs">
          <Group justify="space-between">
            <Group gap="xs" id="image-action-buttons">
              <ActionIcon
                size="md"
                variant="outline"
                onClick={() => {
                  if (currentImage?.mediaID) {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/cameratrap/identify/${currentImage.mediaID}`
                    );
                    alert("Image URL copied to clipboard");
                  }
                }}
              >
                <IconLink />
              </ActionIcon>
              <Tooltip label="Show AI Detections">
                <ActionIcon
                  size="md"
                  onClick={() => setShowAIBoxes((prev) => !prev)}
                  variant={showAIBoxes ? "filled" : "outline"}
                  color="blue"
                  disabled={
                    !currentImage?.aiResults ||
                    currentImage.aiResults.length === 0 ||
                    !currentImage.aiResults[0].animalDetections ||
                    currentImage.aiResults[0].animalDetections.length === 0
                  }
                >
                  <IconFocus2 />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Play Video">
                <ActionIcon
                  size="md"
                  onClick={() => setShowVideo(true)}
                  variant="outline"
                  color="teal"
                  disabled={!currentImage?.videoUrl}
                >
                  <IconPlayerPlay />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Need Help with ID">
                <ActionIcon
                  size="md"
                  onClick={handleNeedsReview}
                  variant={needsReview ? "filled" : "outline"}
                  color="yellow"
                >
                  <IconPhotoSearch />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Report Inappropriate">
                <ActionIcon
                  size="md"
                  onClick={handleFlagged}
                  variant={flagged ? "filled" : "outline"}
                  color="red"
                >
                  <IconMoodWrrr />
                </ActionIcon>
              </Tooltip>
              <Indicator
                inline
                label={currentImage?.favoriteCount}
                disabled={!currentImage?.favoriteCount}
                size={16}
              >
                <ActionIcon
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite();
                  }}
                  color="red"
                  variant={isFavorite ? "filled" : "outline"}
                >
                  {isFavorite ? (
                    <IconHeartFilled size={22} />
                  ) : (
                    <IconHeartPlus size={22} />
                  )}
                </ActionIcon>
              </Indicator>
            </Group>
            <Group gap="xs">
              <Text size="xs" fw={500} style={{ fontFamily: "monospace" }}>
                Time: {currentImage?.timestamp ? new Date(currentImage.timestamp).toLocaleString("en-US", { timeZone: "UTC" }) : 'N/A'}
              </Text>
              <Text size="xs" fw={500} style={{ fontFamily: "monospace" }}>
                ID: {currentImage?.mediaID || 'N/A'}
              </Text>
            </Group>
          </Group>

          <Group gap="xs" style={{ minHeight: 30 }}>
            <SpeciesConsensusBadges
              speciesConsensus={currentImage?.speciesConsensus}
            />
            <ObservationHistoryPopover mediaID={currentImage?.mediaID} />
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
                  src={currentImage?.publicURL}
                  style={{
                    display: "block",
                    maxHeight: "100vh",
                    maxWidth: "100vw",
                    objectFit: "contain",
                  }}
                  alt="Enlarged wildlife image"
                />
                {showAIBoxes && imageLoaded &&
                  currentImage?.aiResults?.[0]?.animalDetections?.map(
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
