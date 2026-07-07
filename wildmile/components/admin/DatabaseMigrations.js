"use client";
import { useState } from "react";
import {
  Stack,
  Card,
  Title,
  Text,
  Button,
  Group,
  Badge,
  Alert,
  Code,
  Divider,
} from "@mantine/core";
import {
  IconDatabase,
  IconCheck,
  IconAlertCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";

// Each migration is defined here. To add a new migration, just append
// an object with { id, name, description, endpoint, method }.
const MIGRATIONS = [
  {
    id: "backfill-random-seed",
    name: "Backfill Random Seed",
    description:
      "Adds a randomSeed field to all CameratrapMedia documents that don't have one. " +
      "Required for the fast random image lookup (replaces slow $sample queries). " +
      "Safe to re-run — only touches documents missing the field.",
    endpoint: "/api/cameratrap/backfill-random-seed",
    method: "GET",
  },
  {
    id: "recalculate-all-user-stats",
    name: "Recalculate All User Stats",
    description:
      "Globally synchronizes and recalculates statistics and achievements for every user in the system. " +
      "Processes camera trap observations, trash logs, and volunteer hours. " +
      "Useful for updating profiles after model changes or fixing historical data inconsistencies. " +
      "Warning: This may take several minutes depending on the number of users and observations.",
    endpoint: "/api/admin/recalculate-stats",
    method: "POST",
  },
];

function MigrationCard({ migration }) {
  const [status, setStatus] = useState("idle"); // idle | running | success | error
  const [result, setResult] = useState(null);

  const runMigration = async () => {
    setStatus("running");
    setResult(null);
    try {
      const response = await fetch(migration.endpoint, {
        method: migration.method || "GET",
      });
      const data = await response.json();
      if (response.ok) {
        setStatus("success");
        setResult(data);
      } else {
        setStatus("error");
        setResult(data);
      }
    } catch (error) {
      setStatus("error");
      setResult({ message: error.message });
    }
  };

  const statusBadge = {
    idle: null,
    running: (
      <Badge color="blue" variant="light">
        Running...
      </Badge>
    ),
    success: (
      <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
        Complete
      </Badge>
    ),
    error: (
      <Badge
        color="red"
        variant="light"
        leftSection={<IconAlertCircle size={12} />}
      >
        Error
      </Badge>
    ),
  };

  return (
    <Card shadow="xs" p="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <div>
            <Group gap="sm">
              <Text fw={600}>{migration.name}</Text>
              {statusBadge[status]}
            </Group>
            <Text size="sm" c="dimmed" mt={4}>
              {migration.description}
            </Text>
          </div>
          <Button
            onClick={runMigration}
            loading={status === "running"}
            disabled={status === "running"}
            leftSection={<IconPlayerPlay size={16} />}
            variant="light"
          >
            Run
          </Button>
        </Group>

        {status === "success" && result && (
          <Alert color="green" variant="light" icon={<IconCheck size={16} />}>
            {result.message}
            {result.matchedCount !== undefined && (
              <Text size="sm" mt={4}>
                Matched: {result.matchedCount} · Modified:{" "}
                {result.modifiedCount}
              </Text>
            )}
            {result.updatedCount !== undefined && (
              <Text size="sm" mt={4}>
                Updated: {result.updatedCount} · Total: {result.totalCount}
              </Text>
            )}
          </Alert>
        )}

        {status === "error" && result && (
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertCircle size={16} />}
          >
            {result.message}
            {result.error && (
              <Code block mt={4}>
                {result.error}
              </Code>
            )}
          </Alert>
        )}
      </Stack>
    </Card>
  );
}

export function DatabaseMigrations() {
  return (
    <Stack gap="md">
      <Group gap="sm">
        <IconDatabase size={24} />
        <Title order={3}>Database Migrations</Title>
      </Group>
      <Text size="sm" c="dimmed">
        One-time database operations that update schema or backfill data. Each
        migration is safe to re-run — it will only modify documents that haven't
        been updated yet. Recalculate All User Stats globally synchronizes and
        recalculates statistics and achievements for every user.
      </Text>
      <Divider />
      {MIGRATIONS.map((migration) => (
        <MigrationCard key={migration.id} migration={migration} />
      ))}
    </Stack>
  );
}
