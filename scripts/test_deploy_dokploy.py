from contextlib import redirect_stdout
from io import StringIO
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import MagicMock
from urllib.error import HTTPError, URLError

spec = importlib.util.spec_from_file_location("deploy_dokploy", Path(__file__).with_name("deploy-dokploy.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.settings = {
            "DOKPLOY_URL": "https://deploy.example.com/",
            "DOKPLOY_API_KEY": "test-only-key",
            "DOKPLOY_COMPOSE_ID": "studio-compose",
            "GITHUB_SHA": "abcdef1234567890",
        }
        self.opener = MagicMock()
        self.opener.open.return_value.__enter__.return_value.status = 200

    def test_targets_compose_deploy_with_auth_and_timeout(self):
        with redirect_stdout(StringIO()):
            self.assertTrue(module.deploy(self.settings, opener=self.opener))
        request = self.opener.open.call_args.args[0]
        self.assertEqual(request.full_url, "https://deploy.example.com/api/compose.deploy")
        self.assertEqual(request.method, "POST")
        self.assertEqual(request.get_header("X-api-key"), "test-only-key")
        self.assertEqual(json.loads(request.data)["composeId"], "studio-compose")
        self.assertEqual(self.opener.open.call_args.kwargs["timeout"], 30)

    def test_missing_settings_never_send_a_request(self):
        for key in module.SETTINGS:
            with self.subTest(key=key):
                with self.assertRaises(RuntimeError):
                    module.deploy({**self.settings, key: ""}, opener=self.opener)
        self.opener.open.assert_not_called()

    def test_invalid_origins_never_send_credentials(self):
        for url in ["http://deploy.example.com", "https://deploy.example.com/api", "https://user:pass@deploy.example.com", "https://deploy.example.com?token=x", "https://deploy.example.com#fragment"]:
            with self.subTest(url=url):
                with self.assertRaises(RuntimeError):
                    module.deploy({**self.settings, "DOKPLOY_URL": url}, opener=self.opener)
        self.opener.open.assert_not_called()

    def test_api_and_network_errors_fail_without_leaking_response(self):
        for error in [HTTPError("https://deploy.example.com", 401, "test-only-key", {}, None), URLError("test-only-key")]:
            self.opener.open.side_effect = error
            with self.assertRaises(RuntimeError) as caught:
                module.deploy(self.settings, opener=self.opener)
            self.assertNotIn("test-only-key", str(caught.exception))

    def test_redirects_are_not_followed(self):
        self.assertIsNone(module.NoRedirects().redirect_request(None, None, 302, "redirect", {}, "https://elsewhere.example"))


if __name__ == "__main__":
    unittest.main()
