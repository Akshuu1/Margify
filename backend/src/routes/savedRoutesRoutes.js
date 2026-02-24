const express = require('express');
const router = express.Router();
const {
    saveRoute,
    saveRouteOption,
    getSavedRoutes,
    getSavedRouteById,
    updateSavedRoute,
    deleteSavedRoute
} = require('../controllers/savedRoutesController');
const { secure } = require('../middleware/middleware');
router.use(secure);

router.post('/', saveRoute);
router.post('/save-option', saveRouteOption);

router.get('/', getSavedRoutes);
router.get('/:id', getSavedRouteById);
router.put('/:id', updateSavedRoute);

router.delete('/:id', deleteSavedRoute);

module.exports = router;
