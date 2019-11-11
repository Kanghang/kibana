/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AgentsRepository, Agent, NewAgent, ListOptions } from './types';
import { DEFAULT_AGENTS_PAGE_SIZE } from '../../../common/constants';
import { FrameworkUser } from '../../adapters/framework/adapter_types';

/**
 * In memory adapter, for testing purpose, all the created agents, are accessible under the public property agents
 */
export class InMemoryAgentsRepository implements AgentsRepository {
  public agents: { [k: string]: Agent } = {};
  private id = 1;

  public async create(
    user: FrameworkUser,
    agent: NewAgent,
    options: { id?: string; overwrite?: boolean }
  ): Promise<Agent> {
    const newAgent = {
      ...agent,
      id: (options && options.id) || `agent-${this.id++}`,
      last_updated: undefined,
      last_checkin: undefined,
      events: [],
      actions: [],
    };

    this.agents[newAgent.id] = newAgent;

    return newAgent;
  }

  public async delete(user: FrameworkUser, agent: Agent): Promise<void> {
    delete this.agents[agent.id];
  }

  public async getById(user: FrameworkUser, id: string): Promise<Agent | null> {
    return this.agents[id] || null;
  }

  public async getBySharedId(user: FrameworkUser, sharedId: string): Promise<Agent | null> {
    const agent = Object.values(this.agents).find(a => a.shared_id === sharedId);

    return agent || null;
  }

  public async getByAccessApiKeyId(
    user: FrameworkUser,
    accessApiKeyId: string
  ): Promise<Agent | null> {
    const agent = Object.values(this.agents).find(a => a.access_api_key_id === accessApiKeyId);

    return agent || null;
  }

  public async update(user: FrameworkUser, id: string, newData: Partial<Agent>): Promise<void> {
    if (this.agents[id]) {
      Object.assign(this.agents[id], newData);
    }
  }

  public async findByMetadata(
    user: FrameworkUser,
    metadata: { local?: any; userProvided?: any }
  ): Promise<Agent[]> {
    return [];
  }

  public async list(
    user: FrameworkUser,
    options: ListOptions = {}
  ): Promise<{ agents: Agent[]; total: number; page: number; perPage: number }> {
    const { page = 1, perPage = DEFAULT_AGENTS_PAGE_SIZE } = options;
    const start = (page - 1) * perPage;
    const agents = Object.values(this.agents).slice(start, start + perPage);
    const total = Object.keys(this.agents).length;

    return { agents, total, page, perPage };
  }

  public async listForPolicy(
    user: FrameworkUser,
    policyId: string,
    options: ListOptions = {}
  ): Promise<{ agents: Agent[]; total: number; page: number; perPage: number }> {
    const { page = 1, perPage = DEFAULT_AGENTS_PAGE_SIZE } = options;
    const start = (page - 1) * perPage;
    const allAgents = Object.values(this.agents).filter(a => a.policy_id === policyId);
    const agents = Object.values(allAgents).slice(start, start + perPage);
    const total = Object.keys(allAgents).length;

    return { agents, total, page, perPage };
  }
}
