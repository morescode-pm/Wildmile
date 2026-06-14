"use client";
import React from "react";
import {
  Title,
  Text,
  Group,
  Stack,
  Card,
  Divider,
  Box,
  Fieldset,
} from "@mantine/core";
import { UserAvatar } from "/components/shared/UserAvatar";

export function Leaderboard({ stats }) {
  return (
    <Fieldset legend="Leaderboard">
      <Stack gap="lg" mt="md">
        <Group justify="space-between" mb="md">
          <Text size="md" fw={500}>
            Top Observers
          </Text>
        </Group>

        {stats.topCreators && stats.topCreators.length > 0 ? (
          <Stack gap="xs">
            {stats.topCreators.map((creator, index) => (
              <Group key={creator.id || index} justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={700} w={20}>{index + 1}.</Text>
                  <UserAvatar userId={creator.id} />
                  <Text size="sm" fw={500} truncate>{creator.name}</Text>
                </Group>
                <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  {creator.count.toLocaleString()} obs
                </Text>
              </Group>
            ))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            No observations recorded yet
          </Text>
        )}

        <Divider my="md" />

        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Most Active (7 days)
            </Text>
            <Box style={{ textAlign: "right" }}>
              <Text size="sm" c="dimmed">
                {stats.mostActive7Days?.name || "No activity"}
              </Text>
              {stats.mostActive7Days?.count > 0 && (
                <Text size="xs" c="dimmed">
                  ({stats.mostActive7Days.count.toLocaleString()} observation
                  {stats.mostActive7Days.count !== 1 ? "s" : ""})
                </Text>
              )}
            </Box>
          </Group>

          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Most Blanks Logged
            </Text>
            <Box style={{ textAlign: "right" }}>
              <Text size="sm" c="dimmed">
                {stats.mostBlanks?.name || "No blanks"}
              </Text>
              {stats.mostBlanks?.count > 0 && (
                <Text size="xs" c="dimmed">
                  ({stats.mostBlanks.count.toLocaleString()})
                </Text>
              )}
            </Box>
          </Group>
        </Stack>
      </Stack>
    </Fieldset>
  );
}
