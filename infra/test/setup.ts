import * as pulumi from "@pulumi/pulumi";

// Register Pulumi runtime mocks so unit tests can exercise resource wiring
// without provisioning anything in Azure. Component modules must be imported
// *inside* tests (dynamic import) so these mocks are installed first.
pulumi.runtime.setMocks(
  {
    newResource: (args: pulumi.runtime.MockResourceArgs): { id: string; state: Record<string, unknown> } => {
      const id = `${args.name}-id`;
      const state: Record<string, unknown> = { ...args.inputs, name: args.name };

      // Provide outputs the program reads back from certain resources.
      if (args.type === "azure-native:managedidentity:UserAssignedIdentity") {
        state.principalId = `${args.name}-principal`;
        state.clientId = `${args.name}-client`;
      }
      if (args.type === "azure-native:keyvault:Vault") {
        state.properties = {
          ...(args.inputs.properties ?? {}),
          vaultUri: `https://${args.name}.vault.azure.net/`,
        };
      }
      if (args.type === "azure-native:cdn:AFDEndpoint") {
        state.hostName = `${args.name}.z01.azurefd.net`;
      }
      return { id, state };
    },
    call: (args: pulumi.runtime.MockCallArgs): Record<string, unknown> => {
      switch (args.token) {
        case "azure-native:authorization:getClientConfig":
          return {
            subscriptionId: "00000000-0000-0000-0000-000000000000",
            tenantId: "11111111-1111-1111-1111-111111111111",
            objectId: "22222222-2222-2222-2222-222222222222",
            clientId: "33333333-3333-3333-3333-333333333333",
          };
        case "azure-native:operationalinsights:getSharedKeys":
          return { primarySharedKey: "mock-primary-key", secondarySharedKey: "mock-secondary-key" };
        default:
          return args.inputs;
      }
    },
  },
  "planer-infra",
  "test",
  false,
);
