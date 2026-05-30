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
  ScrollArea,
  Divider,
} from "@mantine/core";
import { IconClock, IconRefresh, IconUser } from "@tabler/icons-react";
import { Fish, Turtle, Bird, Rabbit } from "lucide-react";
import { FrogIcon } from "/styles/icons/Frog";
import useSWR from "swr";
import { useRecentSpecies, useUserLabeledSpecies } from "./ContextCamera";

const fetcher = (url) => fetch(url).then((res) => res.json());

import Species, { SpeciesList } from "./SpeciesCard";

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

export default function PredefinedSpeciesSidebar({
  onSpeciesSelect,
  searchControl,
}) {
  const {
    data: predefinedData,
    error: predefinedError,
    isLoading: predefinedLoading,
  } = useSWR("/api/species/predefined-species", fetcher, {
    revalidateOnFocus: false,
  });

  const [recentSpecies, setRecentSpecies] = useRecentSpecies();
  const [userLabeledSpecies, setUserLabeledSpecies] = useUserLabeledSpecies();
  const [recentLoading, setRecentLoading] = useState(true);
  const [userLabeledLoading, setUserLabeledLoading] = useState(true);

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

  const loadUserLabeled = useCallback(async () => {
    try {
      const res = await fetch("/api/cameratrap/user-labeled-species");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUserLabeledSpecies(data);
    } catch (error) {
      console.error("Error fetching user labeled species:", error);
    }
  }, [setUserLabeledSpecies]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await Promise.all([loadRecent(), loadUserLabeled()]);
      if (mounted) {
        setRecentLoading(false);
        setUserLabeledLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadRecent, loadUserLabeled]);

  const [selectedCategory, setSelectedCategory] = useState("recent");

  const handleRefresh = async () => {
    if (selectedCategory === "recent") {
      setRecentLoading(true);
      await loadRecent();
      setRecentLoading(false);
    } else if (selectedCategory === "user") {
      setUserLabeledLoading(true);
      await loadUserLabeled();
      setUserLabeledLoading(false);
    }
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
      value: "user",
      label: (
        <Tooltip label="My Animals">
          <Center>
            <IconUser size={20} stroke={1.5} />
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
    predefinedLoading ||
    (selectedCategory === "recent" && recentLoading) ||
    (selectedCategory === "user" && userLabeledLoading);

  if (isLoading) {
    return <Loader />;
  }

  let filteredResults = [];
  if (
    selectedCategory &&
    selectedCategory !== "recent" &&
    selectedCategory !== "user"
  ) {
    filteredResults = predefinedData
      ?.filter((spec) => spec)
      .filter(
        (spec) =>
          iconicTaxonNameToCategory(spec.iconic_taxon_name) === selectedCategory
      );
  } else if (selectedCategory === "recent") {
    filteredResults = recentSpecies;
  } else if (selectedCategory === "user") {
    filteredResults = userLabeledSpecies;
  }

  // Sort alphabetically unless it's the "recent" or "user" category
  if (selectedCategory !== "recent" && selectedCategory !== "user") {
    filteredResults = [...filteredResults].sort((a, b) => {
      const nameA = (a.preferred_common_name || a.name || "").toLowerCase();
      const nameB = (b.preferred_common_name || b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  return (
    <Stack gap="md" h="100%">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Text size="lg" fw={700}>
            Species
          </Text>
          {(selectedCategory === "recent" || selectedCategory === "user") && (
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

      {selectedCategory && (
        <ScrollArea style={{ flex: 1 }} offsetScrollbars>
          {selectedCategory === "user" ? (
            <Stack gap="md">
              {["Mammals", "Birds", "Reptiles", "Amphibians", "Fish", "Other"].map(
                (category) => {
                  const speciesInCategory = userLabeledSpecies
                    .filter(
                      (s) => iconicTaxonNameToCategory(s.iconic_taxon_name) === category
                    )
                    .sort((a, b) => {
                      const nameA = (
                        a.preferred_common_name ||
                        a.name ||
                        ""
                      ).toLowerCase();
                      const nameB = (
                        b.preferred_common_name ||
                        b.name ||
                        ""
                      ).toLowerCase();
                      return nameA.localeCompare(nameB);
                    });

                  if (speciesInCategory.length === 0) return null;

                  return (
                    <Stack key={category} gap="xs">
                      <Divider
                        label={category}
                        labelPosition="left"
                        labelProps={{ fw: 700, size: "sm" }}
                      />
                      <SpeciesList
                        results={speciesInCategory}
                        onSpeciesSelect={onSpeciesSelect}
                      />
                    </Stack>
                  );
                }
              )}
            </Stack>
          ) : (
            filteredResults?.length > 0 && (
              <SimpleGrid cols={3} spacing="xs">
                <Species
                  results={filteredResults}
                  onSpeciesSelect={onSpeciesSelect}
                />
              </SimpleGrid>
            )
          )}
        </ScrollArea>
      )}
    </Stack>
  );
}
