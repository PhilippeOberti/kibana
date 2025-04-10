/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import type { JsonValue } from '@kbn/utility-types';
import { CardIcon } from '@kbn/fleet-plugin/public';
import { EuiSkeletonText } from '@elastic/eui';
import type { Alert } from '@kbn/alerting-types';
import { useGetIntegrationFromPackageName } from '../../../hooks/alert_summary/use_get_integration_from_package_name';

const field = 'related_integrations';
const subField = 'package';

export interface KibanaAlertRelatedIntegrationsCellRendererProps {
  /**
   * Alert data passed from the renderCellValue callback via the AlertWithLegacyFormats interface
   */
  alert: Alert;
  /**
   * Column id passed from the renderCellValue callback via EuiDataGridProps['renderCellValue'] interface
   */
  field: string;
}

/**
 *
 */
export const KibanaAlertRelatedIntegrationsCellRenderer = memo(
  ({ alert, field }: KibanaAlertRelatedIntegrationsCellRendererProps) => {
    const packageName: string | null = useMemo(() => {
      const values: string | number | JsonValue[] = alert[field];

      if (Array.isArray(values)) {
        if (values.length === 1) {
          const value: JsonValue = values[0];
          if (!value || typeof value === 'string' || typeof value === 'boolean') {
            return null;
          }
          const relatedIntegration = value[field];
          if (!relatedIntegration) {
            return null;
          }
          return relatedIntegration[subField];
        } else {
          return null;
        }
      } else {
        return null;
      }
    }, [alert, field]);

    const { integration, isLoading } = useGetIntegrationFromPackageName({ packageName });

    return (
      <EuiSkeletonText isLoading={isLoading} lines={1}>
        {integration ? (
          <CardIcon
            icons={integration.icons}
            integrationName={integration.title}
            packageName={integration.name}
            size="s"
            version={integration.version}
          />
        ) : null}
      </EuiSkeletonText>
    );
  }
);

KibanaAlertRelatedIntegrationsCellRenderer.displayName =
  'KibanaAlertRelatedIntegrationsCellRenderer';
