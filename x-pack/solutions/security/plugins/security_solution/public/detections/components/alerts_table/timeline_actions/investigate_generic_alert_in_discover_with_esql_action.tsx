/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useEffect, useState } from 'react';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import type { DiscoverAppLocatorParams } from '@kbn/discover-plugin/common';
import { DISCOVER_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import type { Query } from '@kbn/es-query';
import { useKibana } from '../../../../common/lib/kibana';
import { InvestigateAlertInDiscoverAction } from './investigate_alert_in_discover_action';
import { useSecurityDefaultPatterns } from '../../../../data_view_manager/hooks/use_security_default_patterns';

const TEST_ID = 'send-generic-alert-to-discover';

interface InvestigateGenericAlertInDiscoverWithESQLActionProps {
  /**
   *
   */
  ecsData: Ecs;
}

/**
 *
 */
export const InvestigateGenericAlertInDiscoverWithESQLAction = memo(
  ({ ecsData }: InvestigateGenericAlertInDiscoverWithESQLActionProps) => {
    const {
      services: { share },
    } = useKibana();
    const discoverLocator = share?.url.locators.get<DiscoverAppLocatorParams>(DISCOVER_APP_LOCATOR);
    const { indexPatterns } = useSecurityDefaultPatterns();

    const [url, setUrl] = useState('');

    useEffect(() => {
      let unmounted = false;

      // const url = useCallback(() => {
      const getDiscoverUrl = async (): Promise<void> => {
        // construct query to pass filters to discover
        const indexNames = indexPatterns.join(',');
        const query: Query = {
          query: `FROM ${indexNames} | WHERE _id='${ecsData?._id}'`,
          language: 'esql',
        };

        if (!discoverLocator) {
          // eslint-disable-next-line no-console
          console.error('Discover locator not available');
          return;
        }

        // return discoverLocator?.getUrl({
        const discoverUrl = await discoverLocator.getUrl({
          query,
        });
        if (unmounted) return;
        setUrl(discoverUrl);
      };

      getDiscoverUrl();

      return () => {
        unmounted = true;
      };
    }, [discoverLocator, ecsData?._id, indexPatterns]);
    // }, [discoverLocator, ecsData?._id, indexPatterns]);

    if (!url) return;

    return <InvestigateAlertInDiscoverAction data-test-subj={TEST_ID} esql={true} url={url} />;
  }
);

InvestigateGenericAlertInDiscoverWithESQLAction.displayName =
  'InvestigateGenericAlertInDiscoverWithESQLAction';
