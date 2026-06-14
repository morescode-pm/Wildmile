import React, { Suspense } from "react";
import {
  Title,
  Text,
  Container,
  Grid,
  GridCol,
  Fieldset,
  Loader,
  Stack,
} from "@mantine/core";
import { IconCardGrid } from "/components/icon_card_grid";
import { IconCardTiles } from "components/cameratrap/IconCardTiles";
import classes from "/styles/card.module.css";
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
import { RandomFavorite } from "components/cameratrap/RandomFavorite";
import { Leaderboard } from "components/cameratrap/Leaderboard";
import { StatsScorecards } from "components/cameratrap/StatsScorecards";
import { getStats } from "app/actions/CameratrapActions";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

const cameraTrapCards = [
  {
    icon: IconPokeball,
    title: "Identify wildlife",
    href: "/cameratrap/identify",
    description:
      "Find and catagorize wildlife captured around the Chicago River",
  },
  {
    icon: IconZoomIn,
    title: "Explore Data",
    href: "/cameratrap/explore",
    description: "Explore wildlife images which have been catagorized",
  },
  {
    icon: IconPaw,
    title: "Wildlife Analytics",
    href: "/cameratrap/wildlife",
    description: "Analyze species activity, temporal patterns, co-occurrence, and biodiversity",
  },
  {
    icon: IconAbacus,
    title: "Project Analytics",
    href: "/cameratrap/analytics/total-images",
    description: "See analytics on images, observations, and volunteers",
  },
];

const mgmtCards = [
  {
    icon: IconCameraPlus,
    title: "New Camera",
    href: "/cameratrap/camera/new",
    description: "Add a new camera device",
  },
  {
    icon: IconCameraSearch,
    title: "Cameras",
    href: "/cameratrap/camera",
    description: "Manage the camera inventory",
  },
  {
    icon: IconUsers,
    title: "Deployments",
    href: "/cameratrap/deployment",
    description: "Manage the deployments",
  },
  {
    icon: IconMapPin,
    title: "Locations",
    href: "/cameratrap/locations",
    description: "Manage the deployment locations",
  },
];

export default async function Page() {
  const [user, stats] = await Promise.all([
    getSession({ headers }),
    getStats(),
  ]);

  return (
    <Container maw="95%" mt="xl" mb="5rem">
      <Stack gap="xl">
        <StatsScorecards stats={stats} />

        <Grid gutter="xl">
          {/* Pane 1: Resources & Management */}
          <GridCol span={{ base: 12, md: 4 }}>
            <Fieldset legend="Camera Trap Resources">
              <Text c="dimmed" ta="center" mt="md">
                Collecting and sharing data about Urban River's projects.
              </Text>
              <IconCardTiles cards={cameraTrapCards} />
              {user && (
                <Fieldset legend="Management Tools" mt="xl">
                  <IconCardTiles cards={mgmtCards} />
                </Fieldset>
              )}
            </Fieldset>
          </GridCol>

          {/* Pane 2: Leaderboard */}
          <GridCol span={{ base: 12, md: 4 }}>
            <Leaderboard stats={stats} />
          </GridCol>

          {/* Pane 3: Favorite Image */}
          <GridCol span={{ base: 12, md: 4 }}>
            <Suspense fallback={<Loader size="sm" />}>
              <RandomFavorite />
            </Suspense>
          </GridCol>
        </Grid>
      </Stack>
    </Container>
  );
}
