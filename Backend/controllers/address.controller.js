import DeliveryAddress from "../models/address.model.js";

export const createDeliveryAddress = async (req, res) => {
    try {
        const {
            receiverName,
            flatNo,
            streetArea,
            landmark,
            buildingName,
            areaName,
            addressType,
            latitude,
            longitude,
            isDefault,
            mobileNumber
        } = req.body;

        if (
            !receiverName ||
            !flatNo ||
            !streetArea || !mobileNumber ||
            latitude == null ||
            longitude == null
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
        }

        if (isDefault) {
            await DeliveryAddress.updateMany(
                { user: req.userId },
                { isDefault: false }
            );
        }

        const address = await DeliveryAddress.create({
            user: req.userId,
            receiverName,
            flatNo,
            streetArea,
            landmark,
            mobileNumber,
            buildingName,
            areaName,
            addressType,
            latitude,
            longitude,
            isDefault,
        });

        return res.status(201).json({
            success: true,
            message: "Address saved successfully.",
            address,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getDeliveryAddresses = async (req, res) => {
  try {
    const addresses = await DeliveryAddress.find({
      user: req.userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDeliveryAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.isDefault) {
      await DeliveryAddress.updateMany(
        { user: req.userId },
        { isDefault: false }
      );
    }

    const address = await DeliveryAddress.findOneAndUpdate(
      {
        _id: id,
        user: req.userId,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.json({
      success: true,
      address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleDeliveryAddress = async (req, res) => {
  try {
    const address = await DeliveryAddress.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDeliveryAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await DeliveryAddress.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};