/**
 * Score-weighted Elo (DUPR-style).
 *
 * rating_change = K * (actual_score_pct - expected_score_pct)
 *
 * actual_score_pct  = your_score / (your_score + opp_score)
 * expected_score_pct = 1 / (1 + 10^((opp_rating - your_rating) / 400))
 */

const K = 32;

export function expectedScore(myRating: number, oppRating: number): number {
    return 1 / (1 + Math.pow(10, (oppRating - myRating) / 400));
}

export function newRating(
    myRating: number,
    oppRating: number,
    myScore: number,
    oppScore: number
): number {
    const actual = myScore / (myScore + oppScore);
    const expected = expectedScore(myRating, oppRating);
    return Math.round(myRating + K * (actual - expected));
}
