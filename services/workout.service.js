// @ts-check

export const estimateSessionWorkout = (goalWeight, goalReps, include1RM = false, unit = "lbs") => {
  const brzyckiFormula = (weight, reps) => Math.round(weight * (36 / (37 - reps)))

  const epleyFormula = (weight, reps) => Math.round(weight * (1 + reps / 30))

  const lombardiFormula = (weight, reps) => Math.round(weight * Math.pow(reps, 0.1))

  const lowerDiscIncrement = unit === "kg" ? 2.5 : 5

  let estimated1RM
  if (goalReps <= 5) {
    estimated1RM = brzyckiFormula(goalWeight, goalReps)
  } else if (goalReps >= 6 && goalReps <= 10) {
    estimated1RM = epleyFormula(goalWeight, goalReps)
  } else {
    estimated1RM = lombardiFormula(goalWeight, goalReps)
  }

  estimated1RM = Math.floor(estimated1RM / lowerDiscIncrement) * lowerDiscIncrement

  const warmUpPercentages = [
    { percent: 0, reps: 10 },
    { percent: 0, reps: 10 },
    { percent: 0.4, reps: 8 },
    { percent: 0.6, reps: 6 },
    { percent: 0.75, reps: 4 },
    { percent: 0.9, reps: 2 },
  ]

  const warmUpSets = warmUpPercentages.map((set, index) => ({
    order: index + 1,
    weight: set.percent === 0
      ? unit === "kg"
        ? 20
        : 45
      : Math.round((estimated1RM * set.percent) / lowerDiscIncrement) * lowerDiscIncrement,
    units: unit,
    reps: set.reps,
  }))

  const topSet = {
    order: warmUpSets.length + 1,
    weight: goalWeight,
    units: unit,
    reps: goalReps,
  }

  const oneRepMaxSet = include1RM
    ? {
        order: warmUpSets.length + 2,
        weight: estimated1RM,
        units: unit,
        reps: 1,
      }
    : null

  return {
    goal: { weight: goalWeight, reps: goalReps },
    estimated1RM,
    sets: [...warmUpSets, topSet, ...(include1RM ? [oneRepMaxSet] : [])],
  }
}
