"use client";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Avatar,
  Container,
  Grid,
  Text,
  Title,
  Card,
  Group,
  Stack,
  Divider,
  Badge,
  Progress,
  Tooltip,
  SimpleGrid,
  Box,
  ThemeIcon,
  Modal,
  ActionIcon,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useUser, fetcher } from "../../lib/hooks";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  IconFlame,
  IconCalendar,
  IconCamera,
  IconPaw,
  IconBug,
  IconCircleCheck,
  IconSchool,
  IconUser,
  IconMapPin,
  IconPencil,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

export default function ProfilePage() {
  const { user, loading, mutate } = useUser();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  const { data: userStats, error: statsError } = useSWR(
    user ? `/api/cameratrap/getUserStats?userId=${user._id}` : null,
    fetcher
  );

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      name: "",
      location: "",
    },

    validate: (values) => {
      return {
        password:
          values.password.length < 8 && values.password.length !== 0
            ? "Password must include at least 8 characters"
            : null,
        name:
          values.name.trim().length < 2
            ? "Name must include at least 2 characters"
            : null,
      };
    },
  });

  useEffect(() => {
    if (!user || !user.profile) return;
    form.setFieldValue("email", user.email || "");
    form.setFieldValue("name", user.profile.name || "");
    form.setFieldValue("location", user.profile.location || "");
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);

  let photoSrc = "https://api.multiavatar.com/noname.png";

  if (user && user.profile) {
    photoSrc = "https://api.multiavatar.com/" + user.profile.name + ".png";
  }

  // Use rank badge if available
  const rankBadge = userStats?.domainRanks?.CAMERATRAP?.currentRank?.badge;
  const displayAvatar = rankBadge || photoSrc;

  async function handleEditProfile(values) {
    if (!values.email) delete values.email;
    if (!values.password) delete values.password;

    const res = await fetch(`/api/user`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const updatedUser = await res.json();
    mutate(updatedUser);
    close();
  }

  const earnedAchievements = userStats?.achievements?.filter(
    (a) => a.progress === 100
  );

  const cameratrapRank = userStats?.domainRanks?.CAMERATRAP?.currentRank;

  if (loading) return null;

  const breadcrumbItems = [
    { title: "Account", href: "#" },
    { title: "Profile", href: "/profile" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} c="dimmed" size="sm" underline="hover">
      {item.title}
    </Anchor>
  ));

  return (
    <Container size="xl" my="2rem">
      <Stack gap="xs" mb="lg">
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
      </Stack>

      <Grid gutter="md">
        {/* Left Column: Profile Info & Progress */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Paper withBorder shadow="md" p={30} radius="md">
              <Stack align="center" gap="lg">
                <Avatar src={displayAvatar} size={150} radius={150} />
                <Stack align="center" gap={4}>
                  <Group gap={8}>
                    <Title order={2} ta="center">
                      {user?.profile?.name || "User Profile"}
                    </Title>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={open}
                      size="sm"
                    >
                      <IconPencil size={18} />
                    </ActionIcon>
                  </Group>
                  <Text c="dimmed" size="sm">
                    {user?.email}
                  </Text>
                </Stack>
                <Stack gap={4} w="100%" align="center">
                  <Badge size="lg" variant="filled" color="blue">
                    Level {userStats?.level || 1}
                  </Badge>
                  <Box w="100%" mt="sm">
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" fw={700} c="dimmed">Progress</Text>
                      <Text size="xs" c="dimmed">{userStats?.totalPoints || 0} pts</Text>
                    </Group>
                    <Progress
                      value={userStats?.totalPoints % 100}
                      size="sm"
                      radius="xl"
                      striped
                      animated
                    />
                  </Box>
                </Stack>

                <Divider w="100%" />

                <Stack gap="xs" w="100%">
                  <Group>
                    <ThemeIcon variant="light" color="gray">
                      <IconCalendar size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        Joined
                      </Text>
                      <Text size="sm">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Recently"}
                      </Text>
                    </Box>
                  </Group>
                  <Group>
                    <ThemeIcon variant="light" color="orange">
                      <IconFlame size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        Longest Streak
                      </Text>
                      <Text size="sm">{userStats?.streaks?.longest || 0} days</Text>
                    </Box>
                  </Group>
                  <Group>
                    <ThemeIcon variant="light" color="red">
                      <IconFlame size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        Current Streak
                      </Text>
                      <Text size="sm">{userStats?.streaks?.current || 0} days</Text>
                    </Box>
                  </Group>
                  {user?.profile?.location && (
                    <Group>
                      <ThemeIcon variant="light" color="blue">
                        <IconMapPin size={18} />
                      </ThemeIcon>
                      <Box>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                          Neighborhood
                        </Text>
                        <Text size="sm">{user.profile.location}</Text>
                      </Box>
                    </Group>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Right Column: Stats & Achievements */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {/* Cameratrap Rank */}
            {cameratrapRank && (
              <Card withBorder shadow="sm" radius="md">
                <Group>
                  <Avatar src={cameratrapRank.badge} size="lg" />
                  <Box style={{ flex: 1 }}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Cameratrap Rank
                    </Text>
                    <Text size="xl" fw={700}>
                      {cameratrapRank.name}
                    </Text>
                    <Text size="sm">{cameratrapRank.description}</Text>
                  </Box>
                </Group>
              </Card>
            )}

            {/* Activity Summary */}
            <Title order={3} mt="sm">
              Activity Summary
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <StatsCard
                title="Images Reviewed"
                value={userStats?.totalImagesReviewed || userStats?.stats?.imagesReviewed || 0}
                icon={<IconCamera size={32} />}
                color="blue"
              />
              <StatsCard
                title="Animals Observed"
                value={userStats?.totalAnimalsObserved || userStats?.stats?.animalsObserved || 0}
                icon={<IconPaw size={32} />}
                color="green"
              />
              <StatsCard
                title="Unique Species"
                value={userStats?.uniqueSpeciesCount || userStats?.stats?.uniqueSpecies || 0}
                icon={<IconBug size={32} />}
                color="teal"
              />
              <StatsCard
                title="Consensus Reached"
                value={userStats?.stats?.speciesConsensus || 0}
                icon={<IconCircleCheck size={32} />}
                color="indigo"
              />
              <StatsCard
                title="Expert Verified"
                value={userStats?.stats?.expertVerified || 0}
                icon={<IconSchool size={32} />}
                color="violet"
              />
            </SimpleGrid>

            {/* Top Species & Badges */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Card withBorder shadow="sm" radius="md" style={{ height: '100%' }}>
                  <Title order={4} mb="md">
                    Top Species Observed
                  </Title>
                  {userStats?.topSpecies && userStats.topSpecies.length > 0 ? (
                    <Stack gap="xs">
                      {userStats.topSpecies.map((species, index) => (
                        <Group key={index} justify="space-between">
                          <Text size="sm">
                            {species.commonName || species.scientificName}
                          </Text>
                          <Badge variant="light" color="gray">
                            {species.count}
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  ) : (
                    <Text c="dimmed" size="sm" ta="center" py="xl">
                      Start identifying wildlife to see your top species!
                    </Text>
                  )}
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Card withBorder shadow="sm" radius="md" style={{ height: '100%' }}>
                  <Title order={4} mb="md">
                    Earned Badges
                  </Title>
                  {earnedAchievements && earnedAchievements.length > 0 ? (
                    <SimpleGrid cols={3} spacing="md">
                      {earnedAchievements.slice(0, 6).map((achievement) => (
                        <Tooltip
                          key={achievement.id}
                          multiline
                          w={220}
                          withArrow
                          label={
                            <Stack gap={4}>
                              <Text fw={700} size="sm">{achievement.name}</Text>
                              <Text size="xs">{achievement.description}</Text>
                              {achievement.criteria && achievement.criteria.length > 0 && (
                                <Box mt={4}>
                                  <Text size="xs" fw={700}>Criteria:</Text>
                                  {achievement.criteria.map((c, i) => (
                                    <Text key={i} size="xs">• {c.type}: {c.threshold}</Text>
                                  ))}
                                </Box>
                              )}
                            </Stack>
                          }
                        >
                          <Stack align="center" gap={4}>
                            <Avatar
                              src={achievement.badge || achievement.icon}
                              size="md"
                              radius="md"
                            />
                            <Text size="xs" fw={500} ta="center" truncate>
                              {achievement.name}
                            </Text>
                          </Stack>
                        </Tooltip>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Text c="dimmed" size="sm" ta="center" py="xl">
                      No badges earned yet.
                    </Text>
                  )}
                </Card>
              </Grid.Col>
            </Grid>

            {/* All Badges (if many) */}
            {earnedAchievements && earnedAchievements.length > 6 && (
              <Paper withBorder p="md" radius="md">
                <Text size="sm" fw={700} mb="md">All Earned Badges</Text>
                <SimpleGrid cols={{ base: 4, sm: 6, md: 8 }} spacing="md">
                  {earnedAchievements.slice(6).map((achievement) => (
                    <Tooltip
                      key={achievement.id}
                      multiline
                      w={220}
                      withArrow
                      label={achievement.description}
                    >
                      <Avatar
                        src={achievement.badge || achievement.icon}
                        size="md"
                        radius="md"
                      />
                    </Tooltip>
                  ))}
                </SimpleGrid>
              </Paper>
            )}
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Edit Profile Modal */}
      <Modal opened={opened} onClose={close} title="Edit Profile" centered>
        <form
          onSubmit={form.onSubmit((values) => {
            handleEditProfile(values);
          })}
        >
          <Stack gap="sm">
            <TextInput
              label="Email"
              placeholder="you@urbanriv.com"
              leftSection={<IconUser size={16} />}
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="New Password"
              placeholder="Leave blank to keep current"
              {...form.getInputProps("password")}
            />
            <TextInput
              label="Name"
              placeholder="Name"
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Neighborhood"
              placeholder="Loop"
              leftSection={<IconMapPin size={16} />}
              {...form.getInputProps("location")}
            />
            <Button mt="md" type="submit" fullWidth>
              Update Profile
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

function StatsCard({ title, value, icon, color }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
        </div>
        <ThemeIcon variant="light" color={color} size="xl" radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}
