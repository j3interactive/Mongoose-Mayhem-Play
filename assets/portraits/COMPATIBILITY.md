# Runtime portrait compatibility

The runtime paths hero-2-detail-v1.png and hero-4-detail-v2.png intentionally contain the approved smiling Tavi v2 and nose-supported glasses Juno v3 artwork. Older deployed bundles still request these paths. Keep both runtime aliases identical to their latest approved versions when building or publishing; do not restore the previous snarling artwork at these public paths. Original generated artwork remains preserved under assets/characters/menu-portraits.

Verify the actual deployed start screen and its requested portrait bytes after every release; a build from an older source snapshot can otherwise restore old portrait references.
