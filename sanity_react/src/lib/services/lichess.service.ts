import axios from 'axios';
import { API_CONFIG } from '@/lib/api-config';
import { handleApiError } from '@/lib/api-client';

const LICHESS_TOKEN_KEY = 'lichessToken';
const LICHESS_TOKEN_SCOPE_KEY = 'lichessTokenScope';

export interface LichessPerf {
  games?: number;
  rating?: number;
  rd?: number;
  prog?: number;
  prov?: boolean;
}

export interface LichessAccountProfile {
  id: string;
  username: string;
  url: string;
  perfs?: Record<string, LichessPerf>;
  profile?: Record<string, unknown>;
  playTime?: {
    total?: number;
    tv?: number;
  };
  count?: Record<string, number>;
  [key: string]: unknown;
}

export interface LichessAccountEmail {
  email: string;
}

export interface LichessArena {
  id: string;
  fullName?: string;
  createdBy?: string;
  nbPlayers?: number;
  startsAt?: number | string;
  finishesAt?: number | string;
  secondsToStart?: number;
  secondsToFinish?: number;
  isFinished?: boolean;
  featured?: Record<string, unknown>;
  duels?: Array<Record<string, unknown>>;
  status?: string;
  [key: string]: unknown;
}

export interface LichessJoinArenaData {
  password?: string;
  team?: string;
  pairMeAsap?: boolean;
}

export interface LichessArenaBoard {
  id: string;
  url: string;
  white?: string;
  black?: string;
  source: 'featured' | 'duel' | 'broadcast';
}

export interface LichessArenaBoards {
  tournamentId: string;
  featured?: LichessArenaBoard;
  duels: LichessArenaBoard[];
}

export interface LichessBroadcastTopItem {
  tour?: {
    id?: string;
    name?: string;
    url?: string;
  };
  round?: {
    id?: string;
    name?: string;
    url?: string;
  };
}

export interface LichessBroadcastTopResponse {
  active?: LichessBroadcastTopItem[];
  upcoming?: LichessBroadcastTopItem[];
  past?: unknown;
}

export interface LichessCreateArenaData {
  clockTime: number;
  clockIncrement: number;
  minutes: number;
  name?: string;
  variant?: string;
  rated?: boolean;
  berserkable?: boolean;
  startDate?: number;
  conditions?: Record<string, unknown>;
}

export interface LichessArenaStatus {
  id: string;
  name: string;
  status: 'upcoming' | 'ongoing' | 'finished' | 'unknown';
  secondsToStart?: number;
  secondsToFinish?: number;
  nbPlayers?: number;
  url?: string;
  raw: LichessArena;
}

export interface LichessArenaResult {
  rank?: number;
  username: string;
  score?: number;
  rating?: number;
  points?: number;
  fire?: boolean;
  sheet?: Array<Record<string, unknown>>;
  raw: Record<string, unknown>;
}

export interface LichessArenaTeamStanding {
  id?: string;
  name?: string;
  score?: number;
  players?: number;
  raw: Record<string, unknown>;
}

export interface LichessBracketMatch {
  id: string;
  round: number;
  roundName: string;
  player1: string;
  player2: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface LichessTournamentBracket {
  tournamentId: string;
  source: 'arena-sheet';
  generatedAt: string;
  rounds: Array<{
    round: number;
    roundName: string;
    matches: LichessBracketMatch[];
  }>;
}

export interface LichessGameExportParams {
  max?: number;
  since?: number;
  until?: number;
  perfType?: string;
  rated?: boolean;
  opening?: boolean;
  clocks?: boolean;
  evals?: boolean;
  moves?: boolean;
  pgnInJson?: boolean;
}

const resolveLichessToken = (): string | null => {
  const localToken = localStorage.getItem(LICHESS_TOKEN_KEY);
  if (localToken) return localToken;
  return API_CONFIG.LICHESS.TOKEN || null;
};

const lichessClient = axios.create({
  baseURL: API_CONFIG.LICHESS_BASE_URL,
  timeout: API_CONFIG.REQUEST_CONFIG.timeout,
  headers: API_CONFIG.REQUEST_CONFIG.headers,
});

lichessClient.interceptors.request.use((config) => {
  const token = resolveLichessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ensureToken = (): string => {
  const token = resolveLichessToken();
  if (!token) {
    throw new Error('Lichess token is missing. Set localStorage key "lichessToken" or VITE_LICHESS_TOKEN.');
  }
  return token;
};

const hasRequiredScope = (requiredScope: string): boolean => {
  const scopeString = localStorage.getItem(LICHESS_TOKEN_SCOPE_KEY) || API_CONFIG.LICHESS.OAUTH_SCOPES || '';
  return scopeString
    .split(/[\s,]+/)
    .map((scope: string) => scope.trim())
    .filter(Boolean)
    .includes(requiredScope);
};

const ensureScope = (requiredScope: string): void => {
  if (!hasRequiredScope(requiredScope)) {
    throw new Error(`Missing scope: ${requiredScope}. Reconnect Lichess and grant this scope.`);
  }
};

const buildQueryParams = (params?: LichessGameExportParams): URLSearchParams => {
  const query = new URLSearchParams();
  if (!params) return query;

  if (typeof params.max === 'number') query.set('max', String(params.max));
  if (typeof params.since === 'number') query.set('since', String(params.since));
  if (typeof params.until === 'number') query.set('until', String(params.until));
  if (params.perfType) query.set('perfType', params.perfType);
  if (typeof params.rated === 'boolean') query.set('rated', String(params.rated));
  if (typeof params.opening === 'boolean') query.set('opening', String(params.opening));
  if (typeof params.clocks === 'boolean') query.set('clocks', String(params.clocks));
  if (typeof params.evals === 'boolean') query.set('evals', String(params.evals));
  if (typeof params.moves === 'boolean') query.set('moves', String(params.moves));
  if (typeof params.pgnInJson === 'boolean') query.set('pgnInJson', String(params.pgnInJson));

  return query;
};

const parseNdjson = <T>(raw: string): T[] => {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as T;
      } catch {
        return null;
      }
    })
    .filter((item): item is T => Boolean(item));
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const asString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const asBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  return undefined;
};

const pickString = (obj: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = asString(obj[key]);
    if (value) return value;
  }
  return undefined;
};

const pickNumber = (obj: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = asNumber(obj[key]);
    if (typeof value === 'number') return value;
  }
  return undefined;
};

const mapArenaResult = (row: unknown): LichessArenaResult | null => {
  const rec = toRecord(row);
  const username = pickString(rec, ['username', 'name', 'user', 'u']);
  if (!username) return null;

  const sheetRaw = rec.sheet;
  const sheet = Array.isArray(sheetRaw)
    ? sheetRaw.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    : undefined;

  return {
    username,
    rank: pickNumber(rec, ['rank', 'r']),
    score: pickNumber(rec, ['score', 's']),
    rating: pickNumber(rec, ['rating', 'rtg']),
    points: pickNumber(rec, ['points', 'p']),
    fire: asBoolean(rec.fire),
    sheet,
    raw: rec,
  };
};

const mapTeamStanding = (row: unknown): LichessArenaTeamStanding | null => {
  const rec = toRecord(row);
  const id = pickString(rec, ['id', 'teamId']);
  const name = pickString(rec, ['name', 'teamName']);
  if (!id && !name) return null;

  return {
    id,
    name,
    score: pickNumber(rec, ['score', 'points']),
    players: pickNumber(rec, ['players', 'nbPlayers']),
    raw: rec,
  };
};

const roundName = (round: number): string => `Round ${round}`;

const buildArenaBracketFromResults = (
  tournamentId: string,
  results: LichessArenaResult[],
): LichessTournamentBracket => {
  const rounds = new Map<number, Map<string, LichessBracketMatch>>();

  for (const result of results) {
    if (!Array.isArray(result.sheet)) continue;

    for (let i = 0; i < result.sheet.length; i += 1) {
      const sheetEntry = toRecord(result.sheet[i]);
      const opponent = pickString(sheetEntry, ['opponent', 'opp', 'o', 'username', 'u']);
      if (!opponent) continue;

      const round = i + 1;
      const p1 = result.username;
      const p2 = opponent;
      const key = [p1.toLowerCase(), p2.toLowerCase()].sort().join('::');

      if (!rounds.has(round)) rounds.set(round, new Map());
      const currentRound = rounds.get(round)!;

      if (!currentRound.has(key)) {
        currentRound.set(key, {
          id: `${tournamentId}-${round}-${key}`,
          round,
          roundName: roundName(round),
          player1: p1,
          player2: p2,
          status: 'completed',
        });
      }
    }
  }

  const serializedRounds = Array.from(rounds.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, matchesMap]) => ({
      round,
      roundName: roundName(round),
      matches: Array.from(matchesMap.values()),
    }));

  return {
    tournamentId,
    source: 'arena-sheet',
    generatedAt: new Date().toISOString(),
    rounds: serializedRounds,
  };
};

const mapArenaStatus = (arena: LichessArena): LichessArenaStatus => {
  let status: LichessArenaStatus['status'] = 'unknown';

  if (arena.isFinished || (typeof arena.secondsToFinish === 'number' && arena.secondsToFinish <= 0)) {
    status = 'finished';
  } else if (typeof arena.secondsToStart === 'number' && arena.secondsToStart > 0) {
    status = 'upcoming';
  } else if (
    (typeof arena.secondsToStart === 'number' && arena.secondsToStart <= 0) ||
    (typeof arena.secondsToFinish === 'number' && arena.secondsToFinish > 0)
  ) {
    status = 'ongoing';
  }

  return {
    id: arena.id,
    name: arena.fullName || String(arena.id),
    status,
    secondsToStart: arena.secondsToStart,
    secondsToFinish: arena.secondsToFinish,
    nbPlayers: arena.nbPlayers,
    url: `https://lichess.org/tournament/${arena.id}`,
    raw: arena,
  };
};

const mapArenaBoard = (raw: Record<string, unknown>, source: 'featured' | 'duel'): LichessArenaBoard | null => {
  const id = asString(raw.id);
  if (!id) return null;

  const white = asString(toRecord(raw.white).name)
    || asString(toRecord(Array.isArray(raw.p) ? raw.p[0] : undefined).n);
  const black = asString(toRecord(raw.black).name)
    || asString(toRecord(Array.isArray(raw.p) ? raw.p[1] : undefined).n);

  return {
    id,
    url: `https://lichess.org/${id}`,
    white,
    black,
    source,
  };
};

const toArenaStatusList = (payload: Record<string, unknown>, key: 'created' | 'started' | 'finished'): LichessArenaStatus[] => {
  const rows = payload[key];
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => toRecord(row) as LichessArena)
    .map((arena) => mapArenaStatus(arena))
    .filter((row) => Boolean(row.id));
};

const extractBroadcastBoardsFromPgn = (pgn: string): LichessArenaBoard[] => {
  const games = pgn.split(/\n\s*\n(?=\[Event\s)/g).filter((chunk) => chunk.includes('[Event'));
  const rows: LichessArenaBoard[] = [];

  for (const game of games) {
    const gameUrlMatch = game.match(/\[(?:GameURL|Site)\s+"([^"]+)"\]/);
    if (!gameUrlMatch) continue;

    const url = gameUrlMatch[1];
    const gameId = url.split('/').filter(Boolean).pop();
    if (!gameId || gameId.length < 6) continue;

    const whiteMatch = game.match(/\[White\s+"([^"]+)"\]/);
    const blackMatch = game.match(/\[Black\s+"([^"]+)"\]/);

    rows.push({
      id: gameId,
      url: `https://lichess.org/${gameId}`,
      white: whiteMatch?.[1],
      black: blackMatch?.[1],
      source: 'broadcast',
    });
  }

  return rows.filter((board, index, arr) => arr.findIndex((b) => b.id === board.id) === index);
};

export const lichessService = {
  setToken(token: string) {
    localStorage.setItem(LICHESS_TOKEN_KEY, token);
  },

  getToken(): string | null {
    return resolveLichessToken();
  },

  isConnected(): boolean {
    return Boolean(resolveLichessToken());
  },

  clearToken() {
    localStorage.removeItem(LICHESS_TOKEN_KEY);
    localStorage.removeItem(LICHESS_TOKEN_SCOPE_KEY);
  },

  /**
   * GET /api/account
   * Requires a valid personal access token.
   */
  async getMyProfile(): Promise<LichessAccountProfile> {
    try {
      ensureToken();
      const response = await lichessClient.get<LichessAccountProfile>(
        API_CONFIG.LICHESS_ENDPOINTS.ACCOUNT_PROFILE,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * GET /api/account/email
   * Requires the email:read scope.
   */
  async getMyEmail(): Promise<LichessAccountEmail> {
    try {
      ensureToken();
      const response = await lichessClient.get<LichessAccountEmail>(
        API_CONFIG.LICHESS_ENDPOINTS.ACCOUNT_EMAIL,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * GET /api/user/{username}
   * Public profile endpoint, no auth required.
   */
  async getUserProfile(username: string): Promise<LichessAccountProfile> {
    try {
      const response = await lichessClient.get<LichessAccountProfile>(
        API_CONFIG.LICHESS_ENDPOINTS.USER_PUBLIC(username),
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Alias to match existing service naming style.
   */
  async getUserDetails(): Promise<LichessAccountProfile> {
    return this.getMyProfile();
  },

  /**
   * Alias to match existing getById/getByX service pattern.
   */
  async getByUsername(username: string): Promise<LichessAccountProfile> {
    return this.getUserProfile(username);
  },

  /**
   * GET /api/tournament
   */
  async getCurrentArenas(): Promise<Record<string, unknown>> {
    try {
      const response = await lichessClient.get<Record<string, unknown>>(
        API_CONFIG.LICHESS_ENDPOINTS.ARENA_CURRENT,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getCurrentArenaStatuses(): Promise<{
    created: LichessArenaStatus[];
    started: LichessArenaStatus[];
    finished: LichessArenaStatus[];
  }> {
    const payload = await this.getCurrentArenas();
    return {
      created: toArenaStatusList(payload, 'created'),
      started: toArenaStatusList(payload, 'started'),
      finished: toArenaStatusList(payload, 'finished'),
    };
  },

  /**
   * POST /api/tournament
   * Requires write scope for tournaments.
   */
  async createArena(payload: LichessCreateArenaData): Promise<LichessArena> {
    try {
      ensureToken();
      ensureScope('tournament:write');
      const response = await lichessClient.post<LichessArena>(
        API_CONFIG.LICHESS_ENDPOINTS.ARENA_CREATE,
        payload,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * POST /api/tournament/{id}
   */
  async updateArena(id: string, payload: LichessCreateArenaData): Promise<LichessArena> {
    try {
      ensureToken();
      ensureScope('tournament:write');
      const response = await lichessClient.post<LichessArena>(
        API_CONFIG.LICHESS_ENDPOINTS.ARENA_BY_ID(id),
        payload,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * GET /api/tournament/{id}
   */
  async getArenaById(id: string): Promise<LichessArena> {
    try {
      const response = await lichessClient.get<LichessArena>(
        API_CONFIG.LICHESS_ENDPOINTS.ARENA_BY_ID(id),
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * POST /api/tournament/{id}/join
   */
  async joinArena(id: string, payload: LichessJoinArenaData = {}): Promise<{ ok: boolean }> {
    try {
      ensureToken();
      ensureScope('tournament:write');

      const body = new URLSearchParams();
      if (payload.password) body.set('password', payload.password);
      if (payload.team) body.set('team', payload.team);
      if (typeof payload.pairMeAsap === 'boolean') body.set('pairMeAsap', String(payload.pairMeAsap));

      await lichessClient.post(
        API_CONFIG.LICHESS_ENDPOINTS.ARENA_JOIN(id),
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return { ok: true };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * POST /api/tournament/{id}/withdraw
   */
  async withdrawArena(id: string): Promise<{ ok: boolean }> {
    try {
      ensureToken();
      ensureScope('tournament:write');

      await lichessClient.post(API_CONFIG.LICHESS_ENDPOINTS.ARENA_WITHDRAW(id));
      return { ok: true };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getArenaBoards(id: string): Promise<LichessArenaBoards> {
    const arena = await this.getArenaById(id);
    const featured = mapArenaBoard(toRecord(arena.featured), 'featured') ?? undefined;
    const duels = Array.isArray(arena.duels)
      ? arena.duels
          .map((row) => mapArenaBoard(toRecord(row), 'duel'))
          .filter((row): row is LichessArenaBoard => Boolean(row))
      : [];

    return {
      tournamentId: id,
      featured,
      duels,
    };
  },

  async getTopBroadcasts(): Promise<LichessBroadcastTopResponse> {
    try {
      const response = await lichessClient.get<LichessBroadcastTopResponse>(
        API_CONFIG.LICHESS_ENDPOINTS.BROADCAST_TOP,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getBroadcastRoundBoards(roundId: string): Promise<LichessArenaBoard[]> {
    try {
      const response = await lichessClient.get<string>(
        API_CONFIG.LICHESS_ENDPOINTS.BROADCAST_ROUND_PGN(roundId),
        {
          responseType: 'text',
          headers: {
            Accept: 'application/x-chess-pgn',
          },
        },
      );

      return extractBroadcastBoardsFromPgn(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getActiveBroadcastBoards(limitRounds: number = 2, limitBoards: number = 6): Promise<LichessArenaBoard[]> {
    const top = await this.getTopBroadcasts();
    const rounds = Array.isArray(top.active) ? top.active.slice(0, Math.max(1, limitRounds)) : [];

    const boardsByRound: LichessArenaBoard[][] = [];
    for (const item of rounds) {
      const roundId = item.round?.id;
      if (!roundId) continue;
      const boards = await this.getBroadcastRoundBoards(roundId).catch(() => []);
      boardsByRound.push(boards);
    }

    return boardsByRound
      .flat()
      .filter((board, index, arr) => arr.findIndex((b) => b.id === board.id) === index)
      .slice(0, Math.max(1, limitBoards));
  },

  /**
   * GET /api/user/{username}/tournament/created (NDJSON)
   */
  async getCreatedArenas(username: string, nb: number = 10): Promise<LichessArena[]> {
    try {
      const response = await lichessClient.get<string>(
        `${API_CONFIG.LICHESS_ENDPOINTS.USER_TOURNAMENTS_CREATED(username)}?nb=${nb}`,
        {
          responseType: 'text',
          headers: {
            Accept: 'application/x-ndjson',
          },
        },
      );

      return parseNdjson<LichessArena>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getArenaStatus(id: string): Promise<LichessArenaStatus> {
    const arena = await this.getArenaById(id);
    return mapArenaStatus(arena);
  },

  async getCreatedArenaStatuses(username: string, nb: number = 10): Promise<LichessArenaStatus[]> {
    const arenas = await this.getCreatedArenas(username, nb);
    return arenas.map(mapArenaStatus);
  },

  /**
   * Alias: keep naming close to current app flow.
   */
  async getTournamentsByUsername(username: string, nb: number = 10): Promise<LichessArenaStatus[]> {
    return this.getCreatedArenaStatuses(username, nb);
  },

  /**
   * Alias: create Lichess tournament (Arena).
   */
  async createTournament(payload: LichessCreateArenaData): Promise<LichessArena> {
    return this.createArena(payload);
  },

  /**
   * Alias: get tournament by id.
   */
  async getTournamentById(id: string): Promise<LichessArena> {
    return this.getArenaById(id);
  },

  /**
   * GET /api/tournament/{id}/results (NDJSON)
   */
  async getArenaResults(
    id: string,
    options: { nb?: number; sheet?: boolean } = { nb: 50, sheet: true },
  ): Promise<LichessArenaResult[]> {
    try {
      const query = new URLSearchParams();
      if (typeof options.nb === 'number') query.set('nb', String(options.nb));
      if (typeof options.sheet === 'boolean') query.set('sheet', String(options.sheet));

      const endpoint = API_CONFIG.LICHESS_ENDPOINTS.ARENA_RESULTS(id);
      const url = query.toString() ? `${endpoint}?${query}` : endpoint;

      const response = await lichessClient.get<string>(url, {
        responseType: 'text',
        headers: {
          Accept: 'application/x-ndjson',
        },
      });

      return parseNdjson<unknown>(response.data)
        .map(mapArenaResult)
        .filter((row): row is LichessArenaResult => Boolean(row));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * GET /api/tournament/{id}/teams
   */
  async getArenaTeamStandings(id: string): Promise<LichessArenaTeamStanding[]> {
    try {
      const response = await lichessClient.get<unknown>(
        API_CONFIG.LICHESS_ENDPOINTS.ARENA_TEAMS(id),
      );

      const payload = response.data;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(toRecord(payload).teams)
          ? (toRecord(payload).teams as unknown[])
          : [];

      return rows
        .map(mapTeamStanding)
        .filter((row): row is LichessArenaTeamStanding => Boolean(row));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Bracket-like structure derived from arena round sheets.
   * Useful for UI bracket visualizations.
   */
  async getTournamentBracket(
    id: string,
    options: { nb?: number } = { nb: 32 },
  ): Promise<LichessTournamentBracket> {
    const results = await this.getArenaResults(id, { nb: options.nb, sheet: true });
    return buildArenaBracketFromResults(id, results);
  },

  /**
   * GET /api/games/user/{username}
   * Returns NDJSON stream as text.
   */
  async getUserGames(username: string, params?: LichessGameExportParams): Promise<string> {
    try {
      const query = buildQueryParams(params).toString();
      const endpoint = API_CONFIG.LICHESS_ENDPOINTS.USER_GAMES_EXPORT(username);
      const url = query ? `${endpoint}?${query}` : endpoint;

      const response = await lichessClient.get<string>(url, {
        responseType: 'text',
        headers: {
          Accept: 'application/x-ndjson',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default lichessService;
