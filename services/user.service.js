// @ts-check

import LyfterUser from "../models/LyfterUser.model.js"

export const updateLyfterUserPaymentStatus = async (lyfterUserId, isAppPaid) => {
  try {
    const lyfterUser = await LyfterUser.findById(lyfterUserId)
    if (!lyfterUser) {
      throw new Error(`Lyfter User not found: ${lyfterUserId}`)
    }
    lyfterUser.isAppPaid = isAppPaid
    await lyfterUser.save()
  } catch (error) {
    console.error(`Error updating payment status of lyfter user: ${lyfterUserId}`)
    throw new Error('Database update failed')
  }
}

export const getLyfterUserFromLyfterUserId = async (lyfterUserId) => {
  try {
    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
    return lyfterUserInDb
  } catch (error) {
    console.error(`Error fetching user: ${lyfterUserId}`)
    throw new Error("Database fetch failed")
  }

}