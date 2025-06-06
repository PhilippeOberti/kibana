/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import type { TutorialSchema, InstructionSetSchema } from '@kbn/home-plugin/server';
import { INSTRUCTION_VARIANT } from '@kbn/home-plugin/server';
import type { CloudSetup } from '@kbn/cloud-plugin/server';
import type { APMIndices } from '@kbn/apm-sources-access-plugin/server';
import {
  createNodeAgentInstructions,
  createDjangoAgentInstructions,
  createFlaskAgentInstructions,
  createRailsAgentInstructions,
  createRackAgentInstructions,
  createJsAgentInstructions,
  createGoAgentInstructions,
  createJavaAgentInstructions,
  createDotNetAgentInstructions,
  createPhpAgentInstructions,
  createOpenTelemetryAgentInstructions,
} from '../../../common/tutorial/instructions/apm_agent_instructions';
import { getOnPremApmServerInstructionSet } from './on_prem_apm_server_instruction_set';

export function createElasticCloudInstructions({
  cloudSetup,
  apmIndices,
  isFleetPluginEnabled,
}: {
  cloudSetup?: CloudSetup;
  apmIndices: APMIndices;
  isFleetPluginEnabled: boolean;
}): TutorialSchema['elasticCloud'] {
  const apmServerUrl = cloudSetup?.apm.url;
  const instructionSets = [];

  if (!apmServerUrl) {
    instructionSets.push(getApmServerInstructionSet(cloudSetup));
  }

  instructionSets.push(getOnPremApmServerInstructionSet({ apmIndices, isFleetPluginEnabled }));
  instructionSets.push(getApmAgentInstructionSet(cloudSetup));

  return {
    instructionSets,
  };
}

function getApmServerInstructionSet(cloudSetup?: CloudSetup): InstructionSetSchema {
  const deploymentId = cloudSetup?.deploymentId;

  return {
    title: i18n.translate('xpack.apm.tutorial.apmServer.title', {
      defaultMessage: 'APM Server',
    }),
    instructionVariants: [
      {
        id: INSTRUCTION_VARIANT.ESC,
        instructions: [
          {
            title: 'Enable the APM Server in the Elastic Cloud user console',
            textPre: i18n.translate('xpack.apm.tutorial.elasticCloud.textPre', {
              defaultMessage:
                'To enable the APM Server go to [the Elastic Cloud console](https://cloud.elastic.co/deployments/{deploymentId}/edit) and enable APM and Fleet in the deployment edit page by clicking on add capacity, and then click on save. Once enabled, refresh this page.',
              values: { deploymentId },
            }),
          },
        ],
      },
    ],
  };
}

function getApmAgentInstructionSet(cloudSetup?: CloudSetup): InstructionSetSchema {
  const apmServerUrl = cloudSetup?.apm.url;
  const secretToken = cloudSetup?.apm.secretToken;

  return {
    title: i18n.translate('xpack.apm.tutorial.elasticCloudInstructions.title', {
      defaultMessage: 'APM Agents',
    }),
    instructionVariants: [
      {
        id: INSTRUCTION_VARIANT.NODE,
        instructions: createNodeAgentInstructions(apmServerUrl, secretToken),
      },
      {
        id: INSTRUCTION_VARIANT.DJANGO,
        instructions: createDjangoAgentInstructions(apmServerUrl, secretToken),
      },
      {
        id: INSTRUCTION_VARIANT.FLASK,
        instructions: createFlaskAgentInstructions(apmServerUrl, secretToken),
      },
      {
        id: INSTRUCTION_VARIANT.RAILS,
        instructions: createRailsAgentInstructions(apmServerUrl, secretToken),
      },
      {
        id: INSTRUCTION_VARIANT.RACK,
        instructions: createRackAgentInstructions(apmServerUrl, secretToken),
      },
      {
        id: INSTRUCTION_VARIANT.JS,
        instructions: createJsAgentInstructions(apmServerUrl),
      },
      {
        id: INSTRUCTION_VARIANT.GO,
        instructions: createGoAgentInstructions(apmServerUrl, secretToken),
      },
      {
        id: INSTRUCTION_VARIANT.JAVA,
        instructions: createJavaAgentInstructions(apmServerUrl, secretToken),
      },
      {
        id: INSTRUCTION_VARIANT.DOTNET,
        instructions: createDotNetAgentInstructions(apmServerUrl, secretToken),
      },
      {
        id: INSTRUCTION_VARIANT.PHP,
        instructions: createPhpAgentInstructions(apmServerUrl, secretToken),
      },
      {
        id: INSTRUCTION_VARIANT.OPEN_TELEMETRY,
        instructions: createOpenTelemetryAgentInstructions(apmServerUrl, secretToken),
      },
    ],
  };
}
