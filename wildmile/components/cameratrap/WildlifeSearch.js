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
const WildlifeSearch = () => {
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [opened, { toggle }] = useDisclosure(false);

  const handleSpeciesSelect = (species) => {
    setSelectedSpecies(species.name || species);
  };

  return (
    <Paper shadow="xs" p="md" withBorder radius="md" h="100%">
      <Stack gap="md" h="100%">
        <Box style={{ flex: 1, overflow: "hidden" }}>
          <PredefinedSpeciesSidebar
            onSpeciesSelect={handleSpeciesSelect}
            searchControl={
              <Button variant="default" leftSection={<IconSearch />} onClick={toggle} size="xs">
                Search
              </Button>
            }
          />
        </Box>
        <Collapse in={opened}>
          <TaxaSearch initialQuery={selectedSpecies} />
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default WildlifeSearch;
