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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useUser, fetcher } from "../../lib/hooks";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  IconTrophy,
  IconFlame,
  IconCalendar,
  IconCamera,
  IconPaw,
  IconBug,
  IconCircleCheck,
  IconSchool,
  IconUser,
  IconMapPin,
} from "@tabler/icons-react";

export default function ProfilePage() {
  const { user, loading, mutate } = useUser();
  const router = useRouter();

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
  }

  const earnedAchievements = userStats?.achievements?.filter(
    (a) => a.progress === 100
  );

  const cameratrapRank = userStats?.domainRanks?.CAMERATRAP?.currentRank;

  if (loading) return null;

  return (
    <Container size="xl" my="4rem">
      <Grid gutter="md">
        {/* Left Column: Profile Info & Edit */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Paper withBorder shadow="md" p={30} radius="md">
              <Stack align="center" gap="xl" mb="xl">
                <Avatar src={displayAvatar} size={150} radius={150} />
                <Stack align="center" gap={0}>
                  <Title order={2} ta="center">
                    {user?.profile?.name || "User Profile"}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {user?.email}
                  </Text>
                </Stack>
                <Badge size="lg" variant="filled" color="blue">
                  Level {userStats?.level || 1}
                </Badge>
              </Stack>

              <Divider my="lg" label="Edit Profile" labelPosition="center" />

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
            </Paper>

            {/* Joining & Streak Stats */}
            <Paper withBorder shadow="md" p="md" radius="md">
              <Stack gap="xs">
                <Group>
                  <ThemeIcon variant="light" color="gray">
                    <IconCalendar size={18} />
                  </ThemeIcon>
                  <Text size="sm">
                    Joined:{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Recently"}
                  </Text>
                </Group>
                <Group>
                  <ThemeIcon variant="light" color="orange">
                    <IconFlame size={18} />
                  </ThemeIcon>
                  <Text size="sm">
                    Longest Streak: {userStats?.streaks?.longest || 0} days
                  </Text>
                </Group>
                <Group>
                  <ThemeIcon variant="light" color="red">
                    <IconFlame size={18} />
                  </ThemeIcon>
                  <Text size="sm">
                    Current Streak: {userStats?.streaks?.current || 0} days
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Right Column: Stats & Achievements */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {/* Level & Points Progress */}
            <Card withBorder shadow="sm" radius="md" p="xl">
              <Group justify="space-between" mb="xs">
                <Text size="lg" fw={700}>
                  Level Progress
                </Text>
                <Text size="sm" c="dimmed">
                  {userStats?.totalPoints || 0} Total Points
                </Text>
              </Group>
              <Progress
                value={userStats?.totalPoints % 100}
                size="xl"
                radius="xl"
                striped
                animated
              />
              <Text size="xs" c="dimmed" mt={5}>
                {100 - (userStats?.totalPoints % 100)} points until next level
              </Text>
            </Card>

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
            <Title order={3} mt="md">
              Activity Summary
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <StatsCard
                title="Images Reviewed"
                value={userStats?.stats?.imagesReviewed || 0}
                icon={<IconCamera size={32} />}
                color="blue"
              />
              <StatsCard
                title="Animals Observed"
                value={userStats?.stats?.animalsObserved || 0}
                icon={<IconPaw size={32} />}
                color="green"
              />
              <StatsCard
                title="Unique Species"
                value={userStats?.stats?.uniqueSpecies || 0}
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

            {/* Earned Badges */}
            <Title order={3} mt="md">
              Earned Badges
            </Title>
            <Paper withBorder p="md" radius="md">
              {earnedAchievements && earnedAchievements.length > 0 ? (
                <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="md">
                  {earnedAchievements.map((achievement) => (
                    <Tooltip
                      key={achievement.id}
                      label={achievement.description}
                      withArrow
                    >
                      <Stack align="center" gap={4}>
                        <Avatar
                          src={achievement.badge || achievement.icon}
                          size="lg"
                          radius="md"
                        />
                        <Text size="xs" fw={500} ta="center">
                          {achievement.name}
                        </Text>
                      </Stack>
                    </Tooltip>
                  ))}
                </SimpleGrid>
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  No badges earned yet. Keep participating to earn badges!
                </Text>
              )}
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
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
