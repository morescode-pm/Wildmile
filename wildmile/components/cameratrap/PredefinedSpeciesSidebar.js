"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Loader,
  SimpleGrid,
  SegmentedControl,
  Stack,
  Text,
  Center,
  Tooltip,
  Group,
  ActionIcon,
} from "@mantine/core";
import { IconClock, IconRefresh } from "@tabler/icons-react";
import { Fish, Turtle, Bird, Rabbit } from "lucide-react";
import { FrogIcon } from "/styles/icons/Frog";
import useSWR from "swr";
import { useRecentSpecies } from "./ContextCamera";

const fetcher = (url) => fetch(url).then((res) => res.json());

import Species from "./SpeciesCard";

function iconicTaxonNameToCategory(iconic_taxon_name) {
  switch (iconic_taxon_name) {
    case "Mammalia":
      return "Mammals";
    case "Aves":
      return "Birds";
    case "Reptilia":
      return "Reptiles";
    case "Amphibia":
      return "Amphibians";
    case "Actinopterygii":
      return "Fish";
    default:
      return "Other";
  }
}

export default function PredefinedSpeciesSidebar({ onSpeciesSelect, searchControl }) {
  const {
    data: predefinedData,
    error: predefinedError,
    isLoading: predefinedLoading,
  } = useSWR("/api/species/predefined-species", fetcher, {
    revalidateOnFocus: false,
  });

  const [recentSpecies, setRecentSpecies] = useRecentSpecies();
  const [recentLoading, setRecentLoading] = useState(true);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/cameratrap/recent-species");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRecentSpecies(data);
    } catch (error) {
      console.error("Error fetching recent species:", error);
    }
  }, [setRecentSpecies]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadRecent();
      if (mounted) setRecentLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadRecent]);

  const [selectedCategory, setSelectedCategory] = useState("recent");

  const handleRefresh = async () => {
    setRecentLoading(true);
    await loadRecent();
    setRecentLoading(false);
  };

  const categoryData = [
    {
      value: "recent",
      label: (
        <Tooltip label="Recently Used">
          <Center>
            <IconClock size={20} stroke={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Mammals",
      label: (
        <Tooltip label="Mammals">
          <Center>
            <Rabbit strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Reptiles",
      label: (
        <Tooltip label="Reptiles">
          <Center>
            <Turtle strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Amphibians",
      label: (
        <Tooltip label="Amphibians">
          <Center>
            <FrogIcon strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Birds",
      label: (
        <Tooltip label="Birds">
          <Center>
            <Bird />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Fish",
      label: (
        <Tooltip label="Fish">
          <Center>
            <Fish />
          </Center>
        </Tooltip>
      ),
    },
  ];

  const handleCategoryChange = (newValue) => {
    setSelectedCategory((prev) => (prev === newValue ? null : newValue));
  };

  if (predefinedError) {
    return <div>Error loading predefined species data.</div>;
  }

  const isLoading =
    predefinedLoading || (selectedCategory === "recent" && recentLoading);

  if (isLoading) {
    return <Loader />;
  }

  let filteredResults = [];
  if (selectedCategory && selectedCategory !== "recent") {
    filteredResults = predefinedData
      ?.filter((spec) => spec)
      .filter(
        (spec) =>
          iconicTaxonNameToCategory(spec.iconic_taxon_name) === selectedCategory
      );
  } else if (selectedCategory === "recent") {
    filteredResults = recentSpecies;
  }

  return (
    <Stack gap="md" h="100%">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Text size="lg" fw={700}>
            Species
          </Text>
          {selectedCategory === "recent" && (
            <ActionIcon variant="subtle" onClick={handleRefresh} size="sm">
              <IconRefresh size={16} />
            </ActionIcon>
          )}
        </Group>
        {searchControl}
      </Group>

      <SegmentedControl
        value={selectedCategory}
        onChange={handleCategoryChange}
        data={categoryData}
        size="xs"
        fullWidth
      />

      {selectedCategory && filteredResults?.length > 0 && (
        <ScrollArea h={600} offsetScrollbars>
          <SimpleGrid cols={2} spacing="xs">
            <Species
              results={filteredResults}
              onSpeciesSelect={onSpeciesSelect}
            />
          </SimpleGrid>
        </ScrollArea>
      )}
    </Stack>
  );
}
