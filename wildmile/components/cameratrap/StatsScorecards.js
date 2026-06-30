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
    <SimpleGrid cols={{ base: 2, sm: 2, md: 3, lg: 5 }} spacing={{ base: 6, sm: "md" }}>
      {scorecardData.map((item) => (
        <Card key={item.title} withBorder padding={6} radius="sm">
          <Group justify="space-between" wrap="nowrap" gap={4}>
            <Text size="10px" c="dimmed" fw={700} tt="uppercase" style={{ lineHeight: 1, flex: 1 }} truncate="end">
              {item.title}
            </Text>
            <item.icon size={14} color={`var(--mantine-color-${item.color}-6)`} style={{ flexShrink: 0 }} />
          </Group>
          <Group align="flex-end" gap={4} mt={4}>
            <Text size="md" fw={800} style={{ lineHeight: 1 }}>
              {item.value}
            </Text>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
