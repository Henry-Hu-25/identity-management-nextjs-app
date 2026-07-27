"use client";

import { Button, Flex, Text } from "@radix-ui/themes";
import { UsersManagement, WorkOsWidgets } from "@workos-inc/widgets";
import { useEffect, useState } from "react";

type WidgetTokenResponse = {
  token?: unknown;
  error?: unknown;
};

export function UsersManagementPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadToken = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/widget-token", {
          method: "POST",
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json()) as WidgetTokenResponse;

        if (!response.ok) {
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : "Unable to load user management.",
          );
        }

        if (typeof body.token !== "string") {
          throw new Error("The widget token response was invalid.");
        }

        setToken(body.token);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setToken(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load user management.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadToken();

    return () => controller.abort();
  }, [requestVersion]);

  if (isLoading) {
    return <Text color="gray">Loading organization members...</Text>;
  }

  if (error || !token) {
    return (
      <Flex direction="column" align="center" gap="3">
        <Text color="red">{error ?? "Unable to load user management."}</Text>
        <Button
          type="button"
          variant="soft"
          onClick={() => setRequestVersion((version) => version + 1)}
        >
          Try again
        </Button>
      </Flex>
    );
  }

  return (
    <WorkOsWidgets>
      <UsersManagement authToken={token} />
    </WorkOsWidgets>
  );
}
