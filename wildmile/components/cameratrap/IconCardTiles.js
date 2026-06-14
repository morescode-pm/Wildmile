"use client";
import { Text, Group, Paper, rem, Stack } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import Link from "next/link";
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

function CardTile({ card }) {
  const { hovered, ref } = useHover();
  const Icon = iconMap[card.icon] || IconPaw;

  return (
    <Paper
      component={Link}
      href={card.href}
      ref={ref}
      withBorder
      p="sm"
      radius="md"
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        transition: "box-shadow 150ms ease",
      }}
      shadow={hovered ? "md" : "xs"}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Icon size={rem(24)} stroke={1.5} />
          <Text fw={500} size="sm">
            {card.title}
          </Text>
        </Group>
        <Text size="xs" c="dimmed" ta="right" style={{ lineHeight: 1.2 }}>
          {card.description}
        </Text>
      </Group>
    </Paper>
  );
}

export function IconCardTiles({ cards }) {
  return (
    <Stack gap="xs">
      {cards.map((card) => (
        <CardTile key={card.title} card={card} />
      ))}
    </Stack>
  );
}
