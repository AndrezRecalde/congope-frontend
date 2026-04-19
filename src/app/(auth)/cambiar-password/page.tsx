"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Paper,
  PasswordInput,
  Button,
  Title,
  Text,
  Alert,
  Stack,
  Group,
} from "@mantine/core";
import { useForm, hasLength } from "@mantine/form";
import {
  IconLock,
  IconAlertCircle,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useAppDispatch } from "@/store/hooks";
import { clearCredentials } from "@/store/slices/authSlice";
import { usuariosService } from "@/services/usuarios.service";
import { getErrorMessage } from "@/services/axios";

export default function CambiarPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
    validate: {
      current_password: hasLength({ min: 1 }, "La contraseña actual es requerida"),
      password: hasLength({ min: 8 }, "La contraseña debe tener al menos 8 caracteres"),
      password_confirmation: (value, values) =>
        value !== values.password ? "Las contraseñas no coinciden" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      await usuariosService.updatePassword(values);
      setSuccess(true);
      
      // Mostrar éxito por 2 segundos y luego redirigir al login para que entre con la nueva
      setTimeout(() => {
        dispatch(clearCredentials());
        localStorage.removeItem("congope_token");
        document.cookie =
          "congope_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
      }, 2000);
    } catch (err) {
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
      <Stack gap={4} mb="lg">
        <Group gap="xs" align="center">
          <IconShieldCheck size={20} color="var(--mantine-color-congope-8)" />
          <Title order={3} c="congope.8">
            Actualizar Contraseña
          </Title>
        </Group>
        <Text size="sm" c="dimmed">
          Por razones de seguridad, debes actualizar tu contraseña autogenerada antes de continuar.
        </Text>
      </Stack>

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

      {success ? (
        <Alert
          icon={<IconShieldCheck size={16} />}
          color="green"
          mb="md"
          radius="md"
          variant="light"
        >
          ¡Contraseña actualizada exitosamente! Redirigiendo al inicio de sesión...
        </Alert>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <PasswordInput
              label="Contraseña Actual"
              placeholder="La contraseña que recibiste"
              leftSection={<IconLock size={16} color="var(--mantine-color-gray-5)" />}
              radius="md"
              size="md"
              {...form.getInputProps("current_password")}
            />

            <PasswordInput
              label="Nueva Contraseña"
              placeholder="Mínimo 8 caracteres"
              leftSection={<IconLock size={16} color="var(--mantine-color-gray-5)" />}
              radius="md"
              size="md"
              {...form.getInputProps("password")}
            />

            <PasswordInput
              label="Confirmar Nueva Contraseña"
              placeholder="Repite tu nueva contraseña"
              leftSection={<IconLock size={16} color="var(--mantine-color-gray-5)" />}
              radius="md"
              size="md"
              {...form.getInputProps("password_confirmation")}
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
              Guardar y Continuar
            </Button>
          </Stack>
        </form>
      )}
    </Paper>
  );
}
