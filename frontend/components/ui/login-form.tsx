'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Box,
    Button,
    Input,
    VStack,
    Heading,
    Text,
    Link,
    InputGroup,
    IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { handleLogin } from '../../app/auth/handleLogin';
import { useRouter } from 'next/navigation';

export function LoginForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    
    const onSubmit = async (data: any) => {
        try {
            await handleLogin(data);
            router.push('/');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const bgColor = "var(--chakra-colors-white)";
    const darkBgColor = "var(--chakra-colors-gray-800)";
    const borderColor = "var(--chakra-colors-gray-200)";
    const darkBorderColor = "var(--chakra-colors-gray-700)";
    const pageBgColor = "var(--chakra-colors-gray-50)";
    const pageDarkBgColor = "var(--chakra-colors-gray-900)";

    return (
        <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minH="100vh" 
            bg={pageBgColor}
            p={4}
            className="dark:bg-gray-900"
        >
            <Box 
                w={{ base: "90%", md: "450px" }} 
                bg={bgColor}
                p={8} 
                borderRadius="lg" 
                boxShadow="lg" 
                border="1px" 
                borderColor={borderColor}
                className="dark:bg-gray-800 dark:border-gray-700"
            >
                <VStack gap={6} align="stretch">
                    <Heading textAlign="center" size="xl">Login</Heading>
                    
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack gap={4}>
                            <Box>
                                <Text as="label" fontWeight="medium" display="block" mb={1}>
                                    <label htmlFor="email">Email</label>
                                </Text>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your-email@example.com"
                                    borderColor={errors.email ? "red.300" : "inherit"}
                                    _hover={{ borderColor: errors.email ? "red.300" : "inherit" }}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                />
                                {errors.email && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                        {errors.email.message?.toString()}
                                    </Text>
                                )}
                            </Box>

                            <Box>
                                <Text as="label" fontWeight="medium" display="block" mb={1}>
                                    <label htmlFor="password">Password</label>
                                </Text>
                                <InputGroup position="relative">
                                    <Box width="100%">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            borderColor={errors.password ? "red.300" : "inherit"}
                                            _hover={{ borderColor: errors.password ? "red.300" : "inherit" }}
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Password must be at least 6 characters',
                                                },
                                            })}
                                        />
                                        <Box position="absolute" right="0" top="0" height="100%" display="flex" alignItems="center" pr={2}>
                                            <IconButton
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </InputGroup>
                                {errors.password && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                        {errors.password.message?.toString()}
                                    </Text>
                                )}
                            </Box>

                            <Button
                                type="submit"
                                colorScheme="blue"
                                width="full"
                                mt={4}
                                loading={isSubmitting}
                            >
                                Login
                            </Button>
                        </VStack>
                    </form>
                    
                    <Text textAlign="center">
                        Don't have an account?{' '}
                        <Link color="blue.500" href="/auth/register">
                            Sign up
                        </Link>
                    </Text>
                    
                    <Link color="blue.500" href="/auth/forgot-password" alignSelf="center">
                        Forgot password?
                    </Link>
                </VStack>
            </Box>
        </Box>
    );
}
