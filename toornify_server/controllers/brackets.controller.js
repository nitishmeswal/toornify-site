import {extractInput} from "../utils/helper.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiErrorResponse} from "../utils/ApiErrorResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import BracketsModel from "../models/brackets.model.js";
import UserModel from "../models/users.models.js";
import mongoose from "mongoose";
import TeamModels from "../models/team.models.js";

// Helper function to generate single elimination bracket
const generateSingleEliminationMatches = (teams) => {
    const matches = [];
    const numTeams = teams.length;

    // Calculate number of rounds needed
    const numRounds = Math.ceil(Math.log2(numTeams));

    // Round 1: Initial matches
    const round1Matches = Math.floor(numTeams / 2);

    for (let i = 0; i < round1Matches; i++) {
        matches.push({
            round: 1,
            team1: teams[i * 2] || null,
            team2: teams[i * 2 + 1] || null,
            winner: null
        });
    }

    // Handle byes (if odd number of teams)
    if (numTeams % 2 !== 0) {
        matches.push({
            round: 1,
            team1: teams[numTeams - 1],
            team2: null,
            winner: null
        });
    }

    // Generate subsequent rounds with empty matches
    let matchesInPreviousRound = matches.length;
    for (let round = 2; round <= numRounds; round++) {
        const matchesInRound = Math.ceil(matchesInPreviousRound / 2);
        for (let i = 0; i < matchesInRound; i++) {
            matches.push({
                round: round,
                team1: null,
                team2: null,
                winner: null
            });
        }
        matchesInPreviousRound = matchesInRound;
    }

    return matches;
};

// Helper function to generate double elimination bracket
const generateDoubleEliminationMatches = (teams) => {
    const matches = [];
    const numTeams = teams.length;

    /*
    Double Elimination Formula:
    - Total matches needed = 2n - 2 (every team must lose twice except winner)
    - Winners Bracket: n - 1 matches (same as single elimination)
    - Losers Bracket: n - 2 matches
    - Grand Final: 1 match

    For 4 teams:
    - Winners Bracket: 3 matches (WB R1: 2 matches, WB R2: 1 match)
    - Losers Bracket: 2 matches (LB R1: 1 match, LB R2: 1 match)
    - Grand Final: 1 match
    - Total: 6 matches ✓
    */

    const totalMatches = (2 * numTeams) - 2;
    const winnersBracketMatches = numTeams - 1;
    const losersBracketMatches = numTeams - 2;

    // WINNERS BRACKET (same structure as single elimination)
    const winnersRounds = Math.ceil(Math.log2(numTeams));

    // Round 1
    const round1Matches = Math.floor(numTeams / 2);
    for (let i = 0; i < round1Matches; i++) {
        matches.push({
            round: 1,
            team1: teams[i * 2] || null,
            team2: teams[i * 2 + 1] || null,
            winner: null
        });
    }

    // Bye for odd teams
    if (numTeams % 2 !== 0) {
        matches.push({
            round: 1,
            team1: teams[numTeams - 1],
            team2: null,
            winner: null
        });
    }

    // Remaining Winners Bracket rounds
    let prevRoundMatches = Math.ceil(numTeams / 2);
    for (let round = 2; round <= winnersRounds; round++) {
        const roundMatches = Math.ceil(prevRoundMatches / 2);
        for (let i = 0; i < roundMatches; i++) {
            matches.push({
                round: round,
                team1: null,
                team2: null,
                winner: null
            });
        }
        prevRoundMatches = roundMatches;
    }

    // LOSERS BRACKET
    const losersBracketStartRound = winnersRounds + 1;

    // Distribute losers bracket matches across rounds
    // Simple distribution: spread matches evenly
    const losersBracketRounds = winnersRounds; // Typically same number of rounds
    const matchesPerLBRound = Math.floor(losersBracketMatches / losersBracketRounds);
    const extraMatches = losersBracketMatches % losersBracketRounds;

    for (let i = 0; i < losersBracketRounds; i++) {
        const roundMatches = matchesPerLBRound + (i < extraMatches ? 1 : 0);
        for (let j = 0; j < roundMatches; j++) {
            matches.push({
                round: losersBracketStartRound + i,
                team1: null,
                team2: null,
                winner: null
            });
        }
    }

    // GRAND FINAL
    matches.push({
        round: losersBracketStartRound + losersBracketRounds,
        team1: null,
        team2: null,
        winner: null
    });

    return matches;
};

// Helper function to generate round robin matches
const generateRoundRobinMatches = (teams) => {
    const matches = [];
    const numTeams = teams.length;

    // Generate all possible pairings
    for (let i = 0; i < numTeams; i++) {
        for (let j = i + 1; j < numTeams; j++) {
            matches.push({
                round: 1, // In round robin, all matches are typically in one "round"
                team1: teams[i],
                team2: teams[j],
                winner: null
            });
        }
    }

    return matches;
};

// Helper function to clear a team from all subsequent rounds
const clearTeamFromNextRounds = (bracket, matchIndex, teamName) => {
    const match = bracket.matches[matchIndex];
    const currentRound = match.round;
    const nextRound = currentRound + 1;

    // Calculate position in current round
    const positionInRound = bracket.matches
        .slice(0, matchIndex)
        .filter(m => m.round === currentRound)
        .length;

    // Find the next match where this team should have advanced
    const nextMatchIndex = bracket.matches.findIndex((m, idx) =>
        m.round === nextRound &&
        idx > matchIndex
    );

    if (nextMatchIndex !== -1) {
        const nextMatch = bracket.matches[nextMatchIndex];

        // Determine which position this team would have been in
        const teamPosition = positionInRound % 2 === 0 ? 'team1' : 'team2';

        // If this team is in the next match, clear it (handle null and string values)
        if (nextMatch[teamPosition] === teamName) {
            bracket.matches[nextMatchIndex][teamPosition] = null;

            // If this team was the winner, clear that too and recurse
            if (nextMatch.winner === teamName) {
                bracket.matches[nextMatchIndex].winner = null;
                clearTeamFromNextRounds(bracket, nextMatchIndex, teamName);
            }
        }
    }
};

const getBrackets = asyncHandler(async(req,res)=>{

    const brackets = await BracketsModel.find();
    if(!brackets) return res.status(200).json(new ApiResponse(200, {}, "No Brackets found"));

    return res.status(200).json(new ApiResponse(200, brackets,"Brackets found"));

})

const getBracketById = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    if(!id) return res.status(400).json(new ApiErrorResponse(400, "Bracket ID is required"));

    const bracket = await BracketsModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
            $lookup:{
                from:'tournaments',
                localField:'tournament_id',
                foreignField:'_id',
                as:'tournament'
            }
        },
        {
            $unwind:{
                path:'$tournament',
                preserveNullAndEmptyArrays:true
            }
        }
    ]);

    if(!bracket || bracket.length === 0) {
        return res.status(404).json(new ApiErrorResponse(404, "Bracket not found"));
    }

    const bracketData = bracket[0];

    // Fetch all team details for teams in the bracket
    const teamIds = bracketData.teams || [];
    const teams = await TeamModels.find({ _id: { $in: teamIds } }).lean();

    // Create a map of team ID to full team object
    const teamMap = {};
    teams.forEach(team => {
        teamMap[team._id.toString()] = team;
    });

    // Replace team IDs with full team objects in the teams array
    bracketData.teams = bracketData.teams.map(teamId => {
        return teamMap[teamId.toString()] || null;
    }).filter(team => team !== null);

    // Populate team data in matches
    if (bracketData.matches && bracketData.matches.length > 0) {
        bracketData.matches = bracketData.matches.map(match => {
            const updatedMatch = { ...match };

            // Populate team1
            if (match.team1) {
                const team1Id = match.team1.toString();
                updatedMatch.team1 = teamMap[team1Id] || null;
            }

            // Populate team2
            if (match.team2) {
                const team2Id = match.team2.toString();
                updatedMatch.team2 = teamMap[team2Id] || null;
            }

            // Populate winner if it exists
            if (match.winner) {
                const winnerId = match.winner.toString();
                updatedMatch.winner = teamMap[winnerId] || null;
            }

            return updatedMatch;
        });
    }

    return res.status(200).json(new ApiResponse(200, bracketData, "Bracket found"));
});

const updateMatch = asyncHandler(async(req, res) => {
    const { bracketId, matchIndex } = req.params;
    const { winner } = req.body;

    // Validation
    if (!bracketId) {
        return res.status(400).json(new ApiResponse(400, null,"Bracket ID is required"));
    }

    if (matchIndex === undefined || matchIndex === null) {
        return res.status(400).json(new ApiResponse(400,null, "Match index is required"));
    }

    if (!winner) {
        return res.status(400).json(new ApiResponse(400, null,"Winner is required"));
    }

    // Find the bracket
    const bracket = await BracketsModel.findById(bracketId);
    if (!bracket) {
        return res.status(404).json(new ApiErrorResponse(404, "Bracket not found"));
    }

    const numTeams = bracket.teams.length;
    const winnersRounds = Math.ceil(Math.log2(numTeams));
    const grandFinalRound = bracket.format === 'double_elimination' ? winnersRounds + winnersRounds + 1 : null;

    // Validate match index
    const matchIndexNum = parseInt(matchIndex);
    if (matchIndexNum < 0 || matchIndexNum >= bracket.matches.length) {
        return res.status(400).json(new ApiErrorResponse(400, "Invalid match index"));
    }

    // Get the match
    const match = bracket.matches[matchIndexNum];

    // Validate winner is one of the participants
    if (winner !== match.team1 && winner !== match.team2) {
        return res.status(400).json(new ApiErrorResponse(400, "Winner must be one of the match participants"));
    }

    // Store the previous winner to clear from subsequent rounds
    const previousWinner = match.winner;

    // Update the match winner
    bracket.matches[matchIndexNum].winner = winner;

    // Auto-advancement logic for single and double elimination
    if (bracket.format === 'single_elimination' || bracket.format === 'double_elimination') {
        // Clear previous winner from all subsequent rounds if they had advanced
        if (previousWinner && previousWinner !== winner) {
            clearTeamFromNextRounds(bracket, matchIndexNum, previousWinner);
        }

        // Find the next match where this winner should advance
        const currentRound = match.round;
        const nextRound = currentRound + 1;

        // Calculate which position in the next round this winner goes to
        const positionInRound = bracket.matches
            .slice(0, matchIndexNum)
            .filter(m => m.round === currentRound)
            .length;

        const nextMatchIndex = bracket.matches.findIndex((m, idx) =>
            m.round === nextRound &&
            idx > matchIndexNum
        );

        if (nextMatchIndex !== -1) {
            // Determine if winner goes to team1 or team2 slot in next match
            // Even positioned matches send winner to team1, odd to team2
            if (positionInRound % 2 === 0) {
                bracket.matches[nextMatchIndex].team1 = winner;
            } else {
                bracket.matches[nextMatchIndex].team2 = winner;
            }
        }
    }

    // Save the updated bracket
    await bracket.save();

    return res.status(200).json(new ApiResponse(200, bracket, "Match updated successfully"));
});

const reorderTeams = asyncHandler(async(req, res) => {
    const { bracketId } = req.params;
    const { from, to, team, replacedTeam } = req.body;

    // Validation
    if (!bracketId) {
        return res.status(400).json(new ApiErrorResponse(400, "Bracket ID is required"));
    }

    if (!from || !to || !team) {
        return res.status(400).json(new ApiErrorResponse(400, "Missing required fields: from, to, team"));
    }

    if (from.matchIndex === undefined || from.position === undefined) {
        return res.status(400).json(new ApiErrorResponse(400, "Invalid 'from' data: matchIndex and position are required"));
    }

    if (to.matchIndex === undefined || to.position === undefined) {
        return res.status(400).json(new ApiErrorResponse(400, "Invalid 'to' data: matchIndex and position are required"));
    }

    // Validate position values
    if (!['team1', 'team2'].includes(from.position) || !['team1', 'team2'].includes(to.position)) {
        return res.status(400).json(new ApiErrorResponse(400, "Position must be 'team1' or 'team2'"));
    }

    // Find the bracket
    const bracket = await BracketsModel.findById(bracketId);
    if (!bracket) {
        return res.status(404).json(new ApiErrorResponse(404, "Bracket not found"));
    }

    // Validate match indices
    const fromMatchIndex = parseInt(from.matchIndex);
    const toMatchIndex = parseInt(to.matchIndex);

    if (fromMatchIndex < 0 || fromMatchIndex >= bracket.matches.length) {
        return res.status(400).json(new ApiErrorResponse(400, "Invalid 'from' match index"));
    }

    if (toMatchIndex < 0 || toMatchIndex >= bracket.matches.length) {
        return res.status(400).json(new ApiErrorResponse(400, "Invalid 'to' match index"));
    }

    // Get the matches
    const fromMatch = bracket.matches[fromMatchIndex];
    const toMatch = bracket.matches[toMatchIndex];

    // Validate that the team exists in the from position
    if (fromMatch[from.position] !== team) {
        return res.status(400).json(new ApiErrorResponse(400, `Team '${team}' not found at specified 'from' position`));
    }

    // Swap teams
    // Update 'to' match
    bracket.matches[toMatchIndex][to.position] = team;

    // Update 'from' match
    bracket.matches[fromMatchIndex][from.position] = replacedTeam || null;

    // Clear winners if teams changed and handle cascade clearing
    if (fromMatch.winner === team) {
        bracket.matches[fromMatchIndex].winner = null;

        // Clear this team from any subsequent rounds (cascade effect)
        if (bracket.format === 'single_elimination' || bracket.format === 'double_elimination') {
            clearTeamFromNextRounds(bracket, fromMatchIndex, team);
        }
    }

    if (toMatch.winner === replacedTeam && replacedTeam) {
        bracket.matches[toMatchIndex].winner = null;

        // Clear replaced team from any subsequent rounds
        if (bracket.format === 'single_elimination' || bracket.format === 'double_elimination') {
            clearTeamFromNextRounds(bracket, toMatchIndex, replacedTeam);
        }
    }

    // Save the updated bracket
    await bracket.save();

    return res.status(200).json(new ApiResponse(200, bracket, "Teams reordered successfully"));
});
const createBracket = asyncHandler(async(req, res) => {
    const input = extractInput(req, ['tournament_id', 'tournament_name', 'format', 'grandFinalType', 'teams', 'userEmail']);

    const existingBracket = await BracketsModel.countDocuments(input.tournament_id);

    if(existingBracket){
      return res.status(400).json(new ApiResponse(400, null,"Bracket already exists"));
    }
    // Validation
    if (!input.teams || !Array.isArray(input.teams) || input.teams.length < 2) {
        return res.status(400).json(new ApiResponse(400, null,"At least 2 teams are required"));
    }

    if (input.format === 'double_elimination' && input.teams.length < 8) {
        return res.status(400).json(new ApiResponse(400, null,"Double elimination requires at least 8 teams"));
    }

    if (!['single_elimination', 'double_elimination', 'round_robin'].includes(input.format)) {
        return res.status(400).json(new ApiResponse(400, null,"Invalid format. Must be single_elimination, double_elimination, or round_robin"));
    }

    // Generate matches based on format
    let matches;
    switch (input.format) {
        case 'single_elimination':
            matches = generateSingleEliminationMatches(input.teams);
            break;
        case 'double_elimination':
            matches = generateDoubleEliminationMatches(input.teams);
            break;
        case 'round_robin':
            matches = generateRoundRobinMatches(input.teams);
            break;
        default:
            console.log('Unsupported format format for ' + input.format);
            return res.status(400).json(new ApiErrorResponse(400, "Invalid format"));
    }

    // Add matches to input
    input.matches = matches;

    // Set consolationFinal from request or default to false
    input.consolationFinal = req.body.consolationFinal || false;

    const user = await UserModel.findOne({email: input.userEmail});
    if(!user){
        return res.status(403).json(new ApiErrorResponse(403, "User not found"));
    }

    // Remove userEmail from input and add userId
    delete input.userEmail;
    input.userId = user._id;

    // Create bracket
    const bracket = await BracketsModel.create(input);
    if (!bracket) {
        return res.status(500).json(new ApiErrorResponse(500, "Failed to create bracket"));
    }

    return res.status(201).json(new ApiResponse(201, bracket, "Bracket created successfully"));
});
export {getBrackets, getBracketById, updateMatch, reorderTeams,createBracket};
