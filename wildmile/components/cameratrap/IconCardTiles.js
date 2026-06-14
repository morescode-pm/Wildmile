"use client";
import { Text, Group, Overlay, Transition, Paper, rem, Stack } from "@mantine/core";
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
        position: "relative",
        textDecoration: "none",
        color: "inherit",
        overflow: "hidden",
        display: "block",
        transition: "transform 150ms ease, box-shadow 150ms ease",
      }}
      shadow={hovered ? "md" : "xs"}
    >
      <Group gap="md" wrap="nowrap">
        <Icon size={rem(28)} stroke={1.5} />
        <Text fw={500} size="sm">
          {card.title}
        </Text>
      </Group>

      <Transition mounted={hovered} transition="fade" duration={200}>
        {(styles) => (
          <Overlay
            color="var(--mantine-color-body)"
            backgroundOpacity={0.95}
            style={{
              ...styles,
              display: "flex",
              alignItems: "center",
              padding: rem(8),
            }}
          >
            <Text size="xs" lineClamp={2}>
              {card.description}
            </Text>
          </Overlay>
        )}
      </Transition>
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
