import { getClient } from "./client";
import { getMapping } from "./getSecrets";

const TempProjectName = "temp_secrets";

export async function getTempSecret(name: string, clear: boolean = true) {
  validateSecretName(name);
  const client = await getClient();
  const mapping: Record<string,string> = await getMapping();
  const id = mapping[name];
  if (!id) {
    throw new Error("Temp secret not found");
  }
  const r = await client.secrets().get(id);

  if (clear) {
    // Once we have the secret, delete it
    await client.secrets().delete([id]);
  }
  return r.value;
}

export async function setTempSecret(name: string, value: string) {
  validateSecretName(name);
  const client = await getClient();
  const created = await client.secrets().create(
    client.organizationId,
    name,
    value,
    "Temp key created: " + new Date(),
    [await getTempProjectId()]
  );
  return created.id;
}

export async function deleteTempSecret(name: string) {
  validateSecretName(name);
  const client = await getClient();
  const mapping: Record<string,string> = await getMapping();
  const id = mapping[name];
  if (id) {
    await client.secrets().delete([id]);
  }
}

const validateSecretName = (name: string) => {
  if (!name.startsWith("TEMP_")) {
    throw new Error("Invalid temp secret name");
  }
}

export async function getTempProjectId() {
  const client = await getClient();
  const projects = await client.projects().list(client.organizationId);
  const r = projects.data.find(p => p.name == TempProjectName)?.id;
  if (!r) {
    throw new Error("Temp project not found");
  }
  return r;
}
