"use client";
import React from "react";
import { Card, Text, SimpleGrid, Group } from "@mantine/core";
import {
  IconPhoto,
  IconEye,
  IconClock,
  IconUsers,
  IconCalendarStats,
} from "@tabler/icons-react";

export function StatsScorecards({ stats }) {
  const scorecardData = [
    {
      title: "Total Images",
      value: stats.totalImages.toLocaleString(),
      icon: IconPhoto,
      color: "blue",
    },
    {
      title: "Images with Observations",
      value: stats.uniqueMediaIds.toLocaleString(),
      icon: IconEye,
      color: "green",
    },
    {
      title: "New Images (30 days)",
      value: stats.newImages30Days.toLocaleString(),
      icon: IconCalendarStats,
      color: "orange",
    },
    {
      title: "Total Volunteers",
      value: stats.totalVolunteers.toLocaleString(),
      icon: IconUsers,
      color: "grape",
    },
    {
      title: "Volunteer Hours",
      value: Math.round(stats.totalObservationTime).toLocaleString(),
      icon: IconClock,
      color: "teal",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 2, md: 3, lg: 5 }} spacing={{ base: "xs", sm: "md" }}>
      {scorecardData.map((item) => (
        <Card key={item.title} withBorder padding="xs" radius="sm">
          <Group justify="space-between" wrap="nowrap">
            <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ lineHeight: 1.1 }}>
              {item.title}
            </Text>
            <item.icon size={16} color={`var(--mantine-color-${item.color}-6)`} style={{ flexShrink: 0 }} />
          </Group>
          <Group align="flex-end" gap="xs" mt="xs">
            <Text size="lg" fw={700}>
              {item.value}
            </Text>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
