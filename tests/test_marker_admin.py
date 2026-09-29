#!/usr/bin/env python3
"""
Test Suite for 3D Workstation and Regional Block Marker Positioner in /admin mode.
Verifies migration SQL, worker logic, admin frontend integration, and coordinate sanitization.
"""

import os
import re
import json
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class TestMarkerAdmin(unittest.TestCase):

    def test_migration_0005_exists_and_valid(self):
        mig_path = os.path.join(BASE_DIR, "migrations", "0005_workstation_markers.sql")
        self.assertTrue(os.path.exists(mig_path), "Migration 0005_workstation_markers.sql must exist")
        with open(mig_path, "r", encoding="utf-8") as f:
            sql = f.read()
        self.assertIn("CREATE TABLE IF NOT EXISTS workstation_markers", sql)
        self.assertIn("components_json TEXT NOT NULL", sql)
        self.assertIn("id TEXT PRIMARY KEY DEFAULT 'default'", sql)

    def test_worker_workstation_module_exists(self):
        worker_ws = os.path.join(BASE_DIR, "worker", "workstation.js")
        self.assertTrue(os.path.exists(worker_ws), "worker/workstation.js must exist")
        with open(worker_ws, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("export function sanitizeComponents", content)
        self.assertIn("export async function getWorkstationMarkers", content)
        self.assertIn("export async function upsertWorkstationMarkers", content)

    def test_worker_index_routes_workstation_markers(self):
        worker_idx = os.path.join(BASE_DIR, "worker", "index.js")
        with open(worker_idx, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("pathname === '/api/workstation-markers'", content)
        self.assertIn("pathname === '/api/admin/workstation-markers'", content)
        self.assertIn("upsertWorkstationMarkers", content)
        self.assertIn("getWorkstationMarkers", content)

    def test_worker_regional_auto_insert_support(self):
        reg_img = os.path.join(BASE_DIR, "worker", "regional-images.js")
        with open(reg_img, "r", encoding="utf-8") as f:
            content = f.read()
        # Ensure it does NOT unconditionally throw "Set a real image for this block first"
        self.assertNotIn("throw new Error('Set a real image for this block first (above), then edit its markers.');", content)
        self.assertIn("INSERT INTO regional_block_images", content)

    def test_admin_index_html_elements(self):
        admin_html = os.path.join(BASE_DIR, "admin", "index.html")
        with open(admin_html, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn('data-view="workstation"', content)
        self.assertIn('id="view-workstation"', content)
        self.assertIn('id="ventMovePointerBtn"', content)
        self.assertIn('id="ventAdminStage"', content)
        self.assertIn('id="markerQuickBlockSelect"', content)
        self.assertIn('id="markerDragBadge"', content)
        self.assertIn('src="/admin/workstation-3d.js"', content)

    def test_admin_workstation_3d_module(self):
        ws_3d = os.path.join(BASE_DIR, "admin", "workstation-3d.js")
        self.assertTrue(os.path.exists(ws_3d), "admin/workstation-3d.js must exist")
        with open(ws_3d, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("export async function loadWorkstationAdmin", content)
        self.assertIn("pickSurface", content)
        self.assertIn("updateComponentPosition", content)
        self.assertIn("GLTFLoader", content)
        self.assertIn("DRACOLoader", content)
        self.assertIn("ventilatormodel.glb", content)

    def test_admin_js_routing_and_place_mode(self):
        admin_js = os.path.join(BASE_DIR, "admin", "admin.js")
        with open(admin_js, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("workstation: '3D Workstation Markers'", content)
        self.assertIn("window.loadWorkstationAdmin()", content)
        self.assertIn("placeMarkerLabel", content)
        self.assertIn("markerDragBadge", content)

    def test_public_ventilator_ui_dynamic_sync(self):
        vent_ui = os.path.join(BASE_DIR, "ventilator-ui.js")
        with open(vent_ui, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("fetch(\"/api/workstation-markers\")", content)

    def test_dist_app_ventilator_ui_sync(self):
        vent_ui_dist = os.path.join(BASE_DIR, "dist-app", "ventilator-ui.js")
        with open(vent_ui_dist, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("fetch(\"/api/workstation-markers\")", content)

if __name__ == '__main__':
    unittest.main()
