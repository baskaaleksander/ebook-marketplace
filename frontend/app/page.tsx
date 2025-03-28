import { Avatar, Box, Button, Text } from "@chakra-ui/react";
import Image from "next/image";
import { Card, Tooltip } from "@chakra-ui/react"
import { ColorModeButton } from "@/components/ui/color-mode";

export default function Home() {
  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Welcome to the Chakra UI Example
      </Text>
    </Box>
  );
}
