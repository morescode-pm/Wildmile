"use client";
import React, { useState } from "react";
import {
  Group,
  Stack,
  Paper,
  Accordion,
  Box,
  Text,
  Collapse,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import TaxaSearch from "./TaxaSearch";
import PredefinedSpeciesSidebar from "./PredefinedSpeciesSidebar";
import { IconSearch } from "@tabler/icons-react";
import { useSelection } from "./ContextCamera";

const WildlifeSearch = () => {
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [opened, { toggle }] = useDisclosure(false);
  const [selection, setSelection] = useSelection();

  const handleSpeciesSelect = (species) => {
    // Check if species is already in selection
    setSelection((prev) => {
      const isSelected = prev.some(
        (item) => (item.taxonId || item.id) === (species.taxonId || species.id)
      );
      if (isSelected) return prev;
      return [...prev, species];
    });
  };

  return (
    <Paper shadow="xs" p="md" withBorder radius="md" h="100%">
      <Stack gap="md" h="100%">
        <PredefinedSpeciesSidebar
          onSpeciesSelect={handleSpeciesSelect}
          searchControl={
            <Button variant="default" leftSection={<IconSearch />} onClick={toggle} size="xs">
              Search
            </Button>
          }
        />
        <Collapse in={opened}>
          <TaxaSearch initialQuery={selectedSpecies} />
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default WildlifeSearch;
