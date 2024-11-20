// @ts-check

import LyfterUser from "../models/LyfterUser.model.js"

export const isAppPaid = async (req, res, next) => {
  try {
    const userData = req.payload.userData
    const { id: lyfterUserId } = userData

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
    if (!lyfterUserInDb) {
      return res.status(401).json({ message: 'Unauthorized access.'})
    }

    if (lyfterUserInDb.isAppPaid) {
      return res.status(409).json({ message: "Payment has already been processed for this user." })
    }

    next()
  } catch (error) {
    res.status(500).json({ message: "Error at isAppPaid validation", error })
  }
}
