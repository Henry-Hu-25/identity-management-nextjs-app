import { withAuth } from "@workos-inc/authkit-nextjs";
import { Flex, Heading, Text } from "@radix-ui/themes";
import { UsersManagementPanel } from "../components/users-management-panel";

export default async function UsersPage() {
  await withAuth({ ensureSignedIn: true });

  return (
    <Flex direction="column" gap="6" style={{ width: "100%" }}>
      <Flex direction="column" gap="2">
        <Heading size="8">Organization users</Heading>
        <Text size="4" color="gray">
          Invite members, update their roles, and manage access to your
          organization.
        </Text>
      </Flex>

      <UsersManagementPanel />
    </Flex>
  );
}
