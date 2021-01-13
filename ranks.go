package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"path"
	"strconv"
)

var fileLocation = path.Join("G:", "Shared drives", "ASA", "Operations", "2020-21", "Match System")

const (
	teamFile = "TEAM-RANK-LIST.csv"
	compFile = "COMPETITION-RANK-LIST.csv"

	series1 = 4
	series2 = 2

	series1Max = 8
	series2Max = 11

	nTeams = 32
	nComps = 6
)

type Match struct {
	// Need Team (not just string) because we may need to re-match a team
	Team     *Team `json:"team"`
	Strength int   `json:"strength"`
}

type Competition struct {
	Name    string   `json:"name"`
	Choices []string `json:"choices"`
	Matches []Match  `json:"matches"`
}

func (c Competition) String() string {
	return fmt.Sprintf("%s, %d matches", c.Name, len(c.Matches))
}

type Team struct {
	Name        string   `json:"name"`
	NumberMatch int      `json:"numberMatch"`
	Choices     []string `json:"choices"`
	Match1      string   `json:"match1"`
	Match2      string   `json:"match2"`
}

func parseTeams() []*Team {
	teamsFile, err := os.OpenFile(path.Join(fileLocation, teamFile), os.O_RDONLY, os.ModePerm)
	if err != nil {
		panic(err)
	}
	defer teamsFile.Close()

	r := csv.NewReader(teamsFile)

	teams := []*Team{}

	// Ignore headers
	r.Read()
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}

		n, err := strconv.Atoi(record[1])
		if err != nil {
			log.Fatal(err)
		}

		choices := make([]string, nComps)
		for i := 0; i < nComps; i++ {
			choices[i] = record[i+3]
		}

		teams = append(teams, &Team{
			Name:        record[0],
			NumberMatch: n,
			Choices:     choices,
		})
	}

	return teams
}

func parseComps() []*Competition {
	compsFile, err := os.OpenFile(path.Join(fileLocation, compFile), os.O_RDONLY, os.ModePerm)
	if err != nil {
		panic(err)
	}
	defer compsFile.Close()

	r := csv.NewReader(compsFile)

	comps := []*Competition{}

	// Ignore headers
	r.Read()
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}

		choices := make([]string, nTeams)
		for i := 0; i < nTeams; i++ {
			choices[i] = record[i+1]
		}

		comps = append(comps, &Competition{
			Name:    record[0],
			Choices: choices,
		})
	}

	return comps
}

// Filter out a particular choice from the team's choices
func removeChoice(team *Team, choiceToRemove string) {
	var newChoices []string
	for _, choice := range team.Choices {
		if choice != choiceToRemove {
			newChoices = append(newChoices, choice)
		}
	}
	team.Choices = newChoices
}

// Remove the worst team from this competition and return it.
func evictWorstTeam(comp *Competition, matchNum int) *Team {
	worstIndex := -1
	worstMatch := Match{}
	for idx, match := range comp.Matches {
		if match.Strength > worstMatch.Strength {
			worstIndex = idx
			worstMatch = match
		}
	}

	if worstIndex >= 0 {
		// UNMATCH OPERATION PT 1. 3/4-STEP REMOVE
		comp.Matches = append(comp.Matches[:worstIndex], comp.Matches[worstIndex+1:]...)
		if matchNum == 1 {
			worstMatch.Team.Match1 = ""
		} else {
			worstMatch.Team.Match2 = ""
		}
		removeChoice(worstMatch.Team, comp.Name)

		return worstMatch.Team
	}

	return nil
}

// Modifies the given teams + competitions
func match(teams []*Team, comps []*Competition, matchNum int) {
	var max int
	if matchNum == 1 {
		max = series1Max
	} else {
		max = series2Max
	}

	// Unmatched teams, teams without a match #1
	unmatchedTeams := teams

	// Just a way to prevent infinite loops
	iterations := 0

	for len(unmatchedTeams) > 0 && iterations < 500 {
		team := unmatchedTeams[0]

		// Alright, who does this team like the most?
		for _, choice := range team.Choices {
			// Find this competition
			var comp *Competition
			for _, c := range comps {
				if c.Name == choice {
					comp = c
					break
				}
			}

			// Is this competition in series 1?
			if comp != nil && comp.Name != "" {
				// How highly did this competition rank this team?
				var strength int
				var choice string
				for strength, choice = range comp.Choices {
					if choice == team.Name {
						break
					}
				}

				// Has this competition already satisfied its matches?
				numMatchesBetterThanMe := 0
				for _, match := range comp.Matches {
					if match.Strength < strength {
						numMatchesBetterThanMe++
					}
				}

				if numMatchesBetterThanMe >= max {
					// This competition is full. Move on to this team's next choice
					continue
				}

				// MATCH OPERATION. 3-STEP ADD
				comp.Matches = append(comp.Matches, Match{Team: team, Strength: strength})
				if matchNum == 1 {
					team.Match1 = comp.Name
				} else {
					team.Match2 = comp.Name
				}
				unmatchedTeams = unmatchedTeams[1:]

				// Evict a team if we cross our limit
				if len(comp.Matches) > max {
					worstTeam := evictWorstTeam(comp, matchNum)

					if worstTeam != nil {
						// UNMATCH OPERATION PT 2. 1/4-STEP REMOVE
						unmatchedTeams = append(unmatchedTeams, worstTeam)
					}
				}

				break
			}
		}

		iterations++
	}
}

func option1(teams []*Team, comps []*Competition) {
	// First series first.
	series1Comps := comps[:series1]
	match(teams, series1Comps, 1)
	fmt.Printf("%v\t%v\t%v\t%v\n", series1Comps[0], series1Comps[1], series1Comps[2], series1Comps[3])
	fmt.Printf("Done!\n")

	// Second series second.
	var series2Teams []*Team
	for _, t := range teams {
		if t.NumberMatch == 2 {
			series2Teams = append(series2Teams, t)
		}
	}

	series2Comps := comps[series1:]
	match(series2Teams, series2Comps, 2)
	fmt.Printf("%v\t%v\n", series2Comps[0], series2Comps[1])
	fmt.Printf("Done!\n")
}

// Option 2
// How do we do this?
// 32 total teams first get divided into the first N competitions
// 21 teams get divided into the last M competitions
//
// 9, 8, 9, 9, 9, 9
// 6 of the fourth come from the first 32
// 3 of the fourth come from the last 21
// then of the last 18
//
// 9 teams per first three competitions, so you have 5 in the fourth one.
// + 4 of the other 21, then you have 9 and then 8
//
// 21 x 2 + 11 = 53, 53/6 = 5 9's and an 8

func main() {
	matchedTeams := parseTeams()
	option1(matchedTeams, parseComps())
	teams := parseTeams()

	choiceSum := 0.0
	for i, t := range matchedTeams {
		originalTeam := teams[i]

		var match1Idx, match2Idx int
		for idx, choice := range originalTeam.Choices {
			if choice == t.Match1 {
				match1Idx = idx
			} else if choice == t.Match2 {
				match2Idx = idx
			}
		}

		fmt.Printf("%-25v matched to %-15v (choice #%d) and %-15v (choice #%d)\n", t.Name, t.Match1, match1Idx+1, t.Match2, match2Idx+1)
		choiceSum += float64(match1Idx + 1)
	}

	fmt.Println("Average first choice", choiceSum/nTeams)
}
