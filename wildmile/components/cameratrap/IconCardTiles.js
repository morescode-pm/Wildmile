"use client";
import {
  Group,
  SimpleGrid,
  Text,
  Card,
  Overlay,
  Center,
  Box,
  AspectRatio,
} from "@mantine/core";
import { useState } from "react";
import {
  IconAbacus,
  IconUsers,
  IconPokeball,
  IconCameraSearch,
  IconCameraPlus,
  IconZoomIn,
  IconMapPin,
  IconPaw,
} from "@tabler/icons-react";

const iconMap = {
  IconAbacus,
  IconUsers,
  IconPokeball,
  IconCameraSearch,
  IconCameraPlus,
  IconZoomIn,
  IconMapPin,
  IconPaw,
};

export function IconCardTiles({ cards }) {
  return (
    <SimpleGrid cols={2} spacing="xs" mt="md">
      {cards.map((card) => (
        <CardTile key={card.title} card={card} />
      ))}
    </SimpleGrid>
  );
}

function CardTile({ card }) {
  const [hovered, setHovered] = useState(false);
  const IconComponent = iconMap[card.icon] || IconPaw;

  return (
    <Card
      component="a"
      href={card.href}
      p="md"
      radius="md"
      withBorder
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        overflow: "hidden",
        height: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        textDecoration: "none",
        transition: "transform 200ms ease, box-shadow 200ms ease",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        boxShadow: hovered ? "var(--mantine-shadow-md)" : "none",
      }}
    >
      <Box style={{ textAlign: "center", width: "100%" }}>
        <IconComponent size="2rem" stroke={1.5} color="var(--mantine-color-blue-6)" />
        <Text size="sm" fw={700} mt="xs" c="dark">
          {card.title}
        </Text>
      </Box>

      {hovered && (
        <Overlay
          color="#000"
          backgroundOpacity={0.85}
          blur={2}
          center
          style={{ padding: "10px" }}
        >
          <Text size="xs" c="white" ta="center">
            {card.description}
          </Text>
        </Overlay>
      )}
    </Card>
  );
}
