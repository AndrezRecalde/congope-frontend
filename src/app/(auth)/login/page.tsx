"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Checkbox,
  Alert,
  Stack,
  Group,
} from "@mantine/core";
import { useForm, isEmail, hasLength } from "@mantine/form";
import {
  IconMail,
  IconLock,
  IconAlertCircle,
  IconShieldLock,
} from "@tabler/icons-react";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/services/axios";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ruta a la que redirigir tras login exitoso
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      recordar: false,
    },
    validate: {
      email: isEmail("Ingresa un email válido"),
      password: hasLength(
        { min: 6 },
        "La contraseña debe tener al menos 6 caracteres",
      ),
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar sin resetear el formulario
    const result = form.validate();
    if (result.hasErrors) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const values = form.values;
      const data = await authService.login({
        email: values.email,
        password: values.password,
      });

      // 1. Guardar en localStorage (lo usa Axios en requests)
      localStorage.setItem("congope_token", data.token);

      // 2. Guardar en cookie (lo leen los Server Components)
      const maxAge = values.recordar
        ? 60 * 60 * 24 * 30 // 30 días si marcó "recordar"
        : 60 * 60 * 8; // 8 horas por defecto

      document.cookie =
        `congope_token=${data.token}; ` +
        `path=/; max-age=${maxAge}; SameSite=Strict`;

      // 3. Actualizar estado Redux
      dispatch(
        setCredentials({
          usuario: data.user,
          token: data.token,
        }),
      );

      // 4. Redirigir
      if (data.user.requires_password_change) {
        router.push("/cambiar-password");
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      // Los campos NO se limpian — solo se muestra el error
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      radius="lg"
      p="xl"
      w="100%"
      style={{
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Cabecera del form */}
      <Stack gap={4} mb="lg">
        <Group gap="xs" align="center">
          <IconShieldLock size={20} color="var(--mantine-color-congope-8)" />
          <Title order={3} c="congope.8">
            Iniciar Sesión
          </Title>
        </Group>
        <Text size="sm" c="dimmed">
          Ingresa tus credenciales institucionales
        </Text>
      </Stack>

      {/* Mensaje de error */}
      {errorMsg && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          mb="md"
          radius="md"
          variant="light"
        >
          {errorMsg}
        </Alert>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Correo electrónico"
            placeholder="usuario@congope.gob.ec"
            leftSection={
              <IconMail size={16} color="var(--mantine-color-gray-5)" />
            }
            radius="md"
            size="md"
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            leftSection={
              <IconLock size={16} color="var(--mantine-color-gray-5)" />
            }
            radius="md"
            size="md"
            {...form.getInputProps("password")}
          />

          <Checkbox
            label="Mantener sesión iniciada por 30 días"
            size="sm"
            {...form.getInputProps("recordar", {
              type: "checkbox",
            })}
          />

          <Button
            type="submit"
            color="congope"
            fullWidth
            size="md"
            loading={loading}
            mt={4}
            style={{ fontWeight: 600 }}
          >
            Iniciar Sesión
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
